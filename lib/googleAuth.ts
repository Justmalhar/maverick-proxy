import { createRemoteJWKSet, jwtVerify } from 'jose';

const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

export interface GoogleClaims {
  sub: string;
  email?: string;
  name?: string;
}

/**
 * Verifies a Google identity token (from native Google Sign-In).
 * Audience must be one of the configured OAuth client ids (GOOGLE_CLIENT_IDS,
 * comma-separated — typically the iOS client id).
 */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleClaims> {
  const audiences = (process.env.GOOGLE_CLIENT_IDS ?? '')
    .split(',').map((s) => s.trim()).filter(Boolean);
  if (!audiences.length) throw new Error('GOOGLE_CLIENT_IDS not configured');

  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: ['https://accounts.google.com', 'accounts.google.com'],
    audience: audiences,
  });
  if (!payload.sub) throw new Error('Google token missing sub');
  return {
    sub: String(payload.sub),
    email: payload.email as string | undefined,
    name: payload.name as string | undefined,
  };
}
