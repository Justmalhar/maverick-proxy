import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

/** Server-side Supabase client. */
export function supa(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  // MUST be the secret / service-role key — it bypasses Row-Level Security.
  // The publishable/anon key is blocked by RLS and will fail every query.
  const key = process.env.SUPABASE_SECRET_KEY
    ?? process.env.SUPABASE_SERVICE_ROLE_KEY
    ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('Supabase env not configured (need SUPABASE_URL + SUPABASE_SECRET_KEY)');
  _client = createClient(url, key, { auth: { persistSession: false } });
  return _client;
}

export interface Profile {
  id: string;
  apple_sub: string;
  email: string | null;
  display_name: string | null;
  tier: string;
}

/** Upserts a profile for an Apple subject and returns it. */
export async function upsertProfile(appleSub: string, email?: string | null, name?: string | null): Promise<Profile> {
  const db = supa();
  const { data, error } = await db
    .from('profiles')
    .upsert(
      { apple_sub: appleSub, email: email ?? null, display_name: name ?? null, updated_at: new Date().toISOString() },
      { onConflict: 'apple_sub' }
    )
    .select('id, apple_sub, email, display_name, tier')
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function getProfile(id: string): Promise<Profile | null> {
  const { data } = await supa().from('profiles').select('id, apple_sub, email, display_name, tier').eq('id', id).single();
  return (data as Profile) ?? null;
}

/** Effective daily message limit: entitlement override or env default. */
export async function dailyLimit(userId: string): Promise<number> {
  const envDefault = parseInt(process.env.DAILY_MESSAGE_LIMIT ?? '50', 10);
  const { data } = await supa()
    .from('entitlements')
    .select('is_active, daily_message_limit')
    .eq('user_id', userId)
    .single();
  if (data?.is_active && typeof data.daily_message_limit === 'number') return data.daily_message_limit;
  return envDefault;
}

export async function deleteAccount(userId: string): Promise<void> {
  // Cascades to entitlements + usage via FK on delete cascade.
  const { error } = await supa().from('profiles').delete().eq('id', userId);
  if (error) throw error;
}
