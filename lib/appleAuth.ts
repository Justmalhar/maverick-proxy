import { createRemoteJWKSet, jwtVerify } from 'jose';

const APPLE_ISS = 'https://appleid.apple.com';
const JWKS = createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'));

export interface AppleClaims {
  sub: string;            // stable user id
  email?: string;
  email_verified?: boolean;
}

/**
 * Verifies an Apple identity token from native Sign in with Apple.
 * For native iOS sign-in, the token `aud` is the app's bundle id.
 */
export async function verifyAppleIdentityToken(idToken: string): Promise<AppleClaims> {
  const audience = process.env.APPLE_AUDIENCE;
  if (!audience) throw new Error('APPLE_AUDIENCE not configured');

  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: APPLE_ISS,
    audience,
  });

  if (!payload.sub) throw new Error('Apple token missing sub');
  return {
    sub: String(payload.sub),
    email: payload.email as string | undefined,
    email_verified: payload.email_verified === true || payload.email_verified === 'true',
  };
}
