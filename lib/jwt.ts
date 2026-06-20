import { SignJWT, jwtVerify } from 'jose';

function secret(): Uint8Array {
  const s = process.env.MAVERICK_JWT_SECRET;
  if (!s) throw new Error('MAVERICK_JWT_SECRET not configured');
  return new TextEncoder().encode(s);
}

type TokenKind = 'access' | 'refresh';

export interface Session {
  uid: string;        // profile id
  kind: TokenKind;
}

export async function mintToken(uid: string, kind: TokenKind): Promise<string> {
  const ttl = kind === 'access'
    ? parseInt(process.env.ACCESS_TOKEN_TTL_SECONDS ?? '3600', 10)
    : parseInt(process.env.REFRESH_TOKEN_TTL_SECONDS ?? '5184000', 10);
  return new SignJWT({ kind })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(uid)
    .setIssuedAt()
    .setExpirationTime(`${ttl}s`)
    .setIssuer('maverick')
    .sign(secret());
}

export async function mintSession(uid: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  const [accessToken, refreshToken] = await Promise.all([mintToken(uid, 'access'), mintToken(uid, 'refresh')]);
  return { accessToken, refreshToken, expiresIn: parseInt(process.env.ACCESS_TOKEN_TTL_SECONDS ?? '3600', 10) };
}

export async function verifyToken(token: string, expected: TokenKind): Promise<Session> {
  const { payload } = await jwtVerify(token, secret(), { issuer: 'maverick' });
  if (payload.kind !== expected) throw new Error('wrong token kind');
  if (!payload.sub) throw new Error('missing sub');
  return { uid: String(payload.sub), kind: expected };
}
