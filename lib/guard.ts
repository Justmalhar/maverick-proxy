import { verifyToken } from './jwt';
import { appAttestRequired, verifyAssertion } from './attest';

export interface AuthCtx { uid: string }

export function json(status: number, message: string, extra: Record<string, unknown> = {}): Response {
  return new Response(JSON.stringify({ error: { message }, ...extra }), {
    status, headers: { 'Content-Type': 'application/json' },
  });
}

/** Authenticates a request via the session access token (+ App Attest if required). */
export async function authenticate(req: Request): Promise<{ ctx?: AuthCtx; error?: Response }> {
  const auth = req.headers.get('authorization') ?? '';
  if (!auth.startsWith('Bearer ')) return { error: json(401, 'Missing session token') };

  let uid: string;
  try {
    uid = (await verifyToken(auth.slice(7), 'access')).uid;
  } catch {
    return { error: json(401, 'Invalid or expired session') };
  }

  if (appAttestRequired()) {
    const ok = await verifyAssertion(req, uid);
    if (!ok) return { error: json(401, 'Device attestation failed') };
  }

  return { ctx: { uid } };
}
