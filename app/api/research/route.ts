import { authenticate, json } from '../../../lib/guard';
import { consumeMessageQuota } from '../../../lib/quota';
import { deepResearch } from '../../../lib/generate';
import { meter } from '../../../lib/meter';

export const runtime = 'nodejs';
export const maxDuration = 300;

// POST { query } → { report }
export async function POST(req: Request): Promise<Response> {
  const { ctx, error } = await authenticate(req);
  if (error) return error;
  const q = await consumeMessageQuota(ctx!.uid);
  if (!q.allowed) return json(429, q.reason ?? 'Quota exceeded', { quota: q });

  let body: { query?: string };
  try { body = await req.json(); } catch { return json(400, 'Invalid JSON'); }
  if (!body.query) return json(400, 'Missing query');

  try {
    const out = await deepResearch(body.query);
    void meter({ uid: ctx!.uid, kind: 'research' });
    return Response.json(out);
  } catch (e) {
    return json(502, e instanceof Error ? e.message : 'Research failed');
  }
}
