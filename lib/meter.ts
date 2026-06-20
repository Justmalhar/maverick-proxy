import { supa } from './supabase';

/** Fire-and-forget usage event to Tinybird (optional). */
export async function meter(event: Record<string, unknown>): Promise<void> {
  const url = process.env.TINYBIRD_EVENTS_URL;
  const token = process.env.TINYBIRD_TOKEN;
  if (!url || !token) return;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...event, ts: new Date().toISOString() }),
    });
  } catch { /* metering must never break a request */ }
}

/** Increments the per-day rollup in Supabase (best-effort). */
export async function bumpDailyUsage(uid: string): Promise<void> {
  const day = new Date().toISOString().slice(0, 10);
  try {
    const db = supa();
    const { data } = await db.from('usage_daily').select('messages').eq('user_id', uid).eq('day', day).single();
    const messages = (data?.messages ?? 0) + 1;
    await db.from('usage_daily').upsert({ user_id: uid, day, messages }, { onConflict: 'user_id,day' });
  } catch { /* ignore */ }
}
