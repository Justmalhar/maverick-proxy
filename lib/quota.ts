import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { dailyLimit } from './supabase';

let _redis: Redis | null = null;
function redis(): Redis {
  if (_redis) return _redis;
  _redis = Redis.fromEnv();   // UPSTASH_REDIS_REST_URL / _TOKEN
  return _redis;
}

// Burst protection: short-window per-user rate limit (abuse / runaway loops).
let _burst: Ratelimit | null = null;
function burst(): Ratelimit {
  if (_burst) return _burst;
  _burst = new Ratelimit({ redis: redis(), limiter: Ratelimit.slidingWindow(20, '1 m'), prefix: 'mv:burst' });
  return _burst;
}

function dayKey(uid: string): string {
  const day = new Date().toISOString().slice(0, 10); // UTC day; matches usage_daily
  return `mv:msg:${uid}:${day}`;
}

export interface QuotaResult { allowed: boolean; remaining: number; limit: number; reason?: string }

/** Checks burst + daily message quota and (if allowed) increments the daily counter. */
export async function consumeMessageQuota(uid: string): Promise<QuotaResult> {
  const b = await burst().limit(uid);
  if (!b.success) return { allowed: false, remaining: 0, limit: 0, reason: 'Too many requests. Slow down a moment.' };

  const limit = await dailyLimit(uid);
  const key = dayKey(uid);
  const count = await redis().incr(key);
  if (count === 1) await redis().expire(key, 60 * 60 * 26); // expire after the day rolls over
  if (count > limit) {
    return { allowed: false, remaining: 0, limit, reason: `Daily limit reached (${limit} messages). Upgrade for more.` };
  }
  return { allowed: true, remaining: Math.max(0, limit - count), limit };
}

export async function remainingToday(uid: string): Promise<QuotaResult> {
  const limit = await dailyLimit(uid);
  const used = (await redis().get<number>(dayKey(uid))) ?? 0;
  return { allowed: used < limit, remaining: Math.max(0, limit - used), limit };
}
