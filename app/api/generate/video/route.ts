import { authenticate, json } from '../../../../lib/guard';
import { consumeMessageQuota } from '../../../../lib/quota';
import { generateVideo } from '../../../../lib/generate';
import { meter } from '../../../../lib/meter';

export const runtime = 'nodejs';
export const maxDuration = 300;

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
    const out = await generateVideo(body.prompt, body.model);
    void meter({ uid: ctx!.uid, kind: 'video' });
    return Response.json(out);
  } catch (e) {
    return json(502, e instanceof Error ? e.message : 'Video generation failed');
  }
}
