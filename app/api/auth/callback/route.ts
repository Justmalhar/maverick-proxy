import { exchangeCode } from '../../../../lib/googleOAuth';
import { verifyGoogleIdToken } from '../../../../lib/googleAuth';
import { upsertProfile } from '../../../../lib/supabase';
import { mintSession } from '../../../../lib/jwt';

export const runtime = 'nodejs';

// GET /api/auth/callback?code=<code>&state=<state>
// Google redirects here after the user consents. We exchange the code,
// mint a session, and redirect to the Electron deep-link so the app
// receives the tokens without the user seeing a browser page.
export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    const msg = encodeURIComponent(error ?? 'missing_code');
    return Response.redirect(`maverick-voice://auth/error?reason=${msg}`, 302);
  }

  try {
    const { idToken } = await exchangeCode(code);
    // Web OAuth flow: aud is the web client ID, not the mobile GOOGLE_CLIENT_IDS.
    const claims = await verifyGoogleIdToken(idToken, process.env.GOOGLE_OAUTH_CLIENT_ID);
    const profile = await upsertProfile(`google:${claims.sub}`, claims.email, claims.name);
    const session = await mintSession(profile.id);

    const params = new URLSearchParams({
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
      expires_in: String(session.expiresIn),
      email: profile.email ?? '',
      display_name: profile.display_name ?? '',
      tier: profile.tier,
    });

    return Response.redirect(`maverick-voice://auth/success?${params}`, 302);
  } catch (e) {
    console.error('[auth/callback]', e);
    const msg = encodeURIComponent((e as Error).message ?? 'server_error');
    return Response.redirect(`maverick-voice://auth/error?reason=${msg}`, 302);
  }
}
