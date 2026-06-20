import { verifyGoogleIdToken } from '../../../../lib/googleAuth';
import { upsertProfile } from '../../../../lib/supabase';
import { mintSession } from '../../../../lib/jwt';
import { json } from '../../../../lib/guard';

export const runtime = 'nodejs';

// POST { idToken, fullName? } → { accessToken, refreshToken, expiresIn, user }
export async function POST(req: Request): Promise<Response> {
  let body: { idToken?: string; fullName?: string };
  try { body = await req.json(); } catch { return json(400, 'Invalid JSON'); }

  if (!body.idToken) return json(400, 'Missing idToken');

  let claims;
  try {
    claims = await verifyGoogleIdToken(body.idToken);
  } catch {
    return json(401, 'Could not verify Google token');
  }

  const profile = await upsertProfile(`google:${claims.sub}`, claims.email, claims.name ?? body.fullName);
  const session = await mintSession(profile.id);

  return Response.json({
    ...session,
    user: { id: profile.id, email: profile.email, displayName: profile.display_name, tier: profile.tier },
  });
}
