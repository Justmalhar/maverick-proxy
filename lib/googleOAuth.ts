// Server-side Google OAuth 2.0 code exchange (for desktop / Electron clients).
// Distinct from lib/googleAuth.ts which verifies native ID tokens from mobile.

export interface OAuthTokens {
  idToken: string;
  accessToken: string;
}

/** Build the Google OAuth authorization URL the user's browser is redirected to. */
export function buildAuthUrl(state: string): string {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;
  if (!clientId || !redirectUri) throw new Error('GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_REDIRECT_URI not configured');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt: 'select_account',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

/** Exchange an authorization code for tokens. Returns the id_token for profile extraction. */
export async function exchangeCode(code: string): Promise<OAuthTokens> {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Google OAuth env vars not configured');
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: 'authorization_code' }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google token exchange failed (${res.status}): ${err.slice(0, 200)}`);
  }

  const data = await res.json() as { id_token?: string; access_token?: string };
  if (!data.id_token || !data.access_token) throw new Error('Google response missing id_token or access_token');
  return { idToken: data.id_token, accessToken: data.access_token };
}
