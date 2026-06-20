import { authenticate, json } from '../../../../lib/guard';
import { consumeMessageQuota } from '../../../../lib/quota';
import { generateImage } from '../../../../lib/generate';
import { meter } from '../../../../lib/meter';

export const runtime = 'nodejs';
export const maxDuration = 120;

// POST { prompt, model? } → { text, media: [url] }
export async function POST(req: Request): Promise<Response> {
  const { ctx, error } = await authenticate(req);
  if (error) return error;
  const q = await consumeMessageQuota(ctx!.uid);
  if (!q.allowed) return json(429, q.reason ?? 'Quota exceeded', { quota: q });

  let body: { prompt?: string; model?: string };
  try { body = await req.json(); } catch { return json(400, 'Invalid JSON'); }
  if (!body.prompt) return json(400, 'Missing prompt');

  try {
    const out = await generateImage(body.prompt, body.model);
    void meter({ uid: ctx!.uid, kind: 'image' });
    return Response.json(out);
  } catch (e) {
    return json(502, e instanceof Error ? e.message : 'Image generation failed');
  }
}
