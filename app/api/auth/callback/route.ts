import { exchangeCode } from '../../../../lib/googleOAuth';
import { verifyGoogleIdToken } from '../../../../lib/googleAuth';
import { upsertProfile } from '../../../../lib/supabase';
import { mintSession } from '../../../../lib/jwt';

export const runtime = 'nodejs';

// Render a self-closing HTML page that fires the deep link via JS and then
// shows a "you can close this tab" message. A bare 302 → maverick-voice://
// leaves the browser tab open on whatever page the OS deep-link prompt shows.
function deepLinkPage(deepLink: string, isError = false): Response {
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Maverick Voice${isError ? ' — Error' : ''}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{display:flex;align-items:center;justify-content:center;min-height:100vh;
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      background:#0a0a0a;color:#f5f5f7}
    .card{text-align:center;padding:48px 40px;max-width:400px}
    .icon{font-size:48px;margin-bottom:20px}
    h1{font-size:20px;font-weight:600;margin-bottom:8px}
    p{font-size:14px;color:#8e8e93;line-height:1.5}
    .dim{font-size:12px;color:#48484a;margin-top:24px}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${isError ? '⚠️' : '✅'}</div>
    <h1>${isError ? 'Sign-in failed' : 'Signed in!'}</h1>
    <p>${isError ? 'Something went wrong. Please try again from the app.' : 'Returning you to Maverick Voice…'}</p>
    <p class="dim">You can close this tab.</p>
  </div>
  <script>
    // Fire the deep link immediately. The browser will prompt the user to open
    // the app; once they do (or if the OS handles it silently) this tab is done.
    window.location.href = ${JSON.stringify(deepLink)};
    // Attempt to close the tab after a short delay — only works when the tab
    // was opened programmatically (window.open), so this is best-effort.
    setTimeout(() => { try { window.close(); } catch(_){} }, 1500);
  </script>
</body>
</html>`;
  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

// GET /api/auth/callback?code=<code>&state=<state>
// Google redirects here after the user consents. We exchange the code,
// mint a session, and hand off to the Electron deep-link via an HTML page
// so the browser tab can show a proper "you can close this" message.
export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    const msg = encodeURIComponent(error ?? 'missing_code');
    return deepLinkPage(`maverick-voice://auth/error?reason=${msg}`, true);
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

    return deepLinkPage(`maverick-voice://auth/success?${params}`);
  } catch (e) {
    console.error('[auth/callback]', e);
    const msg = encodeURIComponent((e as Error).message ?? 'server_error');
    return deepLinkPage(`maverick-voice://auth/error?reason=${msg}`, true);
  }
}
