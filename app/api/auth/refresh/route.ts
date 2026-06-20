import { verifyToken, mintSession } from '../../../../lib/jwt';
import { json } from '../../../../lib/guard';

export const runtime = 'nodejs';

// POST { refreshToken } → { accessToken, refreshToken, expiresIn }
export async function POST(req: Request): Promise<Response> {
  let body: { refreshToken?: string };
  try { body = await req.json(); } catch { return json(400, 'Invalid JSON'); }
  if (!body.refreshToken) return json(400, 'Missing refreshToken');

  let uid: string;
  try { uid = (await verifyToken(body.refreshToken, 'refresh')).uid; }
  catch { return json(401, 'Invalid or expired refresh token'); }

  return Response.json(await mintSession(uid));
}
