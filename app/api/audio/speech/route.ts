import { authenticate, json } from '../../../../lib/guard';
import { meter } from '../../../../lib/meter';
import { resolveTTS, DEFAULT_TTS_VOICE } from '../../../../config';

export const runtime = 'nodejs';
export const maxDuration = 120;

// Kokoro's effective input limit is ~4k tokens ≈ 2000 characters of English text.
const MAX_CHUNK_CHARS = 2000;

// Split at sentence/paragraph boundaries so chunks sound natural.
function splitIntoChunks(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];
  const chunks: string[] = [];
  let remaining = text.trim();
  while (remaining.length > maxLen) {
    let split = -1;
    // Prefer splitting at paragraph, then sentence, then clause, then word boundary.
    for (const sep of ['\n\n', '. ', '! ', '? ', '.\n', ';\s', ', ', ' ']) {
      const idx = remaining.lastIndexOf(sep, maxLen);
      if (idx > 0) { split = idx + sep.length; break; }
    }
    if (split <= 0) split = maxLen;
    const chunk = remaining.slice(0, split).trim();
    if (chunk) chunks.push(chunk);
    remaining = remaining.slice(split).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks.filter(c => c.length > 0);
}

async function synthesizeChunk(
  text: string,
  up: { providerId: string; baseUrl: string; key: string; model: string },
  voice: string,
): Promise<{ buffer: ArrayBuffer; status: number }> {
  let r: Response;
  if (up.providerId === 'elevenlabs') {
    r = await fetch(`${up.baseUrl}/text-to-speech/${voice}`, {
      method: 'POST',
      headers: { 'xi-api-key': up.key, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify({ text, model_id: up.model }),
    });
  } else {
    r = await fetch(`${up.baseUrl}/audio/speech`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${up.key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: up.model, voice, input: text, response_format: 'mp3' }),
    });
  }
  return { buffer: await r.arrayBuffer(), status: r.status };
}

// POST { input, voice?, model? } — synthesize via the configured TTS. → audio/mpeg
// Long inputs are automatically split into chunks and concatenated (Kokoro 4k limit).
export async function POST(req: Request): Promise<Response> {
  const { ctx, error } = await authenticate(req);
  if (error) return error;

  let body: { input?: string; voice?: string; model?: string };
  try { body = await req.json(); } catch { return json(400, 'Invalid JSON'); }
  if (!body.input) return json(400, 'Missing input');

  const up = resolveTTS(body.model);
  if (!up) return json(500, 'No TTS provider configured');
  const voice = body.voice || DEFAULT_TTS_VOICE;

  const chunks = splitIntoChunks(body.input, MAX_CHUNK_CHARS);

  // Synthesize all chunks (sequentially to preserve order; Kokoro is fast).
  const buffers: ArrayBuffer[] = [];
  let lastStatus = 200;
  for (const chunk of chunks) {
    const { buffer, status } = await synthesizeChunk(chunk, up, voice);
    if (status < 200 || status > 299) { lastStatus = status; break; }
    buffers.push(buffer);
  }

  void meter({ uid: ctx!.uid, kind: 'tts', model: up.model, provider: up.providerId, status: lastStatus });
  if (lastStatus < 200 || lastStatus > 299) return json(lastStatus, 'Speech failed');

  // Concatenate MP3 frames — valid because MPEG audio frames are self-synchronizing.
  const total = buffers.reduce((n, b) => n + b.byteLength, 0);
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const buf of buffers) { merged.set(new Uint8Array(buf), offset); offset += buf.byteLength; }

  return new Response(merged, { status: 200, headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' } });
}
