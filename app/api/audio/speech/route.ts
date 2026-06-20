import { authenticate, json } from '../../../../lib/guard';
import { meter } from '../../../../lib/meter';
import { resolveTTS, DEFAULT_TTS_VOICE } from '../../../../config';

export const runtime = 'nodejs';
export const maxDuration = 120;

// POST { input, voice?, model? } — synthesize via the configured TTS. → audio/mpeg
export async function POST(req: Request): Promise<Response> {
  const { ctx, error } = await authenticate(req);
  if (error) return error;

  let body: { input?: string; voice?: string; model?: string };
  try { body = await req.json(); } catch { return json(400, 'Invalid JSON'); }
  if (!body.input) return json(400, 'Missing input');

  const up = resolveTTS(body.model);
  if (!up) return json(500, 'No TTS provider configured');
  const voice = body.voice || DEFAULT_TTS_VOICE;

  let r: Response;
  if (up.providerId === 'elevenlabs') {
    r = await fetch(`${up.baseUrl}/text-to-speech/${voice}`, {
      method: 'POST',
      headers: { 'xi-api-key': up.key, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify({ text: body.input, model_id: up.model }),
    });
  } else {
    // OpenAI-compatible /audio/speech
    r = await fetch(`${up.baseUrl}/audio/speech`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${up.key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: up.model, voice, input: body.input, response_format: 'mp3' }),
    });
  }

  void meter({ uid: ctx!.uid, kind: 'tts', model: up.model, provider: up.providerId, status: r.status });
  if (!r.ok) return json(r.status, 'Speech failed');
  return new Response(r.body, { status: 200, headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' } });
}
