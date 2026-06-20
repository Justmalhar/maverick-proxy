import { authenticate, json } from '../../../../lib/guard';
import { consumeMessageQuota } from '../../../../lib/quota';
import { meter, bumpDailyUsage } from '../../../../lib/meter';
import { resolveLLM } from '../../../../config';

export const runtime = 'nodejs';
export const maxDuration = 300;

// POST { model, messages, stream } — gated SSE relay routed by the curated config.
export async function POST(req: Request): Promise<Response> {
  const { ctx, error } = await authenticate(req);
  if (error) return error;

  const quota = await consumeMessageQuota(ctx!.uid);
  if (!quota.allowed) return json(429, quota.reason ?? 'Quota exceeded', { quota });

  let payload: { model?: string; messages?: unknown; stream?: boolean };
  try { payload = await req.json(); } catch { return json(400, 'Invalid JSON'); }

  // Resolve the model against our curated catalog (unknown → default).
  const up = resolveLLM(payload.model);
  if (!up) return json(500, 'No upstream configured for this model');

  const upstream = await fetch(`${up.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${up.key}`,
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      'HTTP-Referer': 'https://mobii.world',
      'X-Title': 'Maverick Chat',
    },
    body: JSON.stringify({ ...payload, model: up.model }),
  });

  void bumpDailyUsage(ctx!.uid);
  void meter({ uid: ctx!.uid, kind: 'chat', model: up.model, provider: up.providerId, status: upstream.status });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Quota-Remaining': String(quota.remaining),
    },
  });
}
