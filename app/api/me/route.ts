import { authenticate, json } from '../../../lib/guard';
import { getProfile } from '../../../lib/supabase';
import { remainingToday } from '../../../lib/quota';

export const runtime = 'nodejs';

// GET → profile + remaining daily quota
export async function GET(req: Request): Promise<Response> {
  const { ctx, error } = await authenticate(req);
  if (error) return error;

  const profile = await getProfile(ctx!.uid);
  if (!profile) return json(404, 'Profile not found');

  const quota = await remainingToday(ctx!.uid);
  return Response.json({
    user: { id: profile.id, email: profile.email, displayName: profile.display_name, tier: profile.tier },
    quota: { remaining: quota.remaining, limit: quota.limit },
  });
}
