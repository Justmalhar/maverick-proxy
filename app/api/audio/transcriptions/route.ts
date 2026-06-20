import { authenticate, json } from '../../../../lib/guard';
import { meter } from '../../../../lib/meter';
import { resolveSTT } from '../../../../config';

export const runtime = 'nodejs';
export const maxDuration = 120;

// POST raw audio (audio/m4a) — transcribe via the configured default STT. → { text }
export async function POST(req: Request): Promise<Response> {
  const { ctx, error } = await authenticate(req);
  if (error) return error;

  const up = resolveSTT(req.headers.get('x-model') ?? undefined);
  if (!up) return json(500, 'No STT provider configured');

  const audio = await req.arrayBuffer();
  if (audio.byteLength === 0) return json(400, 'Empty audio');

  let text = '';
  let status = 200;

  if (up.providerId === 'deepgram') {
    const url = `${up.baseUrl}/listen?model=${encodeURIComponent(up.model)}&smart_format=true`;
    const r = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Token ${up.key}`, 'Content-Type': 'audio/m4a' },
      body: audio,
    });
    status = r.status;
    if (r.ok) {
      const data = await r.json();
      text = data?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? '';
    }
  } else {
    // OpenAI-compatible multipart (Groq / OpenAI)
    const form = new FormData();
    form.append('file', new Blob([audio], { type: 'audio/m4a' }), 'audio.m4a');
    form.append('model', up.model);
    form.append('response_format', 'json');
    const r = await fetch(`${up.baseUrl}/audio/transcriptions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${up.key}` },
      body: form,
    });
    status = r.status;
    if (r.ok) text = (await r.json())?.text ?? '';
  }

  void meter({ uid: ctx!.uid, kind: 'stt', model: up.model, provider: up.providerId, status });
  if (status < 200 || status >= 300) return json(status, 'Transcription failed');
  return Response.json({ text: text.trim() });
}
