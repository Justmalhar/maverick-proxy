import { verifyAppleIdentityToken } from '../../../../lib/appleAuth';
import { upsertProfile } from '../../../../lib/supabase';
import { mintSession } from '../../../../lib/jwt';
import { json } from '../../../../lib/guard';

export const runtime = 'nodejs';

// POST { identityToken, fullName? } → { accessToken, refreshToken, expiresIn, user }
export async function POST(req: Request): Promise<Response> {
  let body: { identityToken?: string; fullName?: string };
  try { body = await req.json(); } catch { return json(400, 'Invalid JSON'); }

  const idToken = body.identityToken;
  if (!idToken) return json(400, 'Missing identityToken');

  let claims;
  try {
    claims = await verifyAppleIdentityToken(idToken);
  } catch {
    return json(401, 'Could not verify Apple token');
  }

  const profile = await upsertProfile(claims.sub, claims.email, body.fullName);
  const session = await mintSession(profile.id);

  return Response.json({
    ...session,
    user: { id: profile.id, email: profile.email, displayName: profile.display_name, tier: profile.tier },
  });
}
