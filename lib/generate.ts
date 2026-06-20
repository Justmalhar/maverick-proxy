import { Upstream, resolveImage, resolveVideo, resolveSong, resolveSystem } from '../config';

// Best-effort generation helpers via OpenRouter's OpenAI-compatible API.
// (Image gen uses the `modalities` extension; video/song shapes may need tuning
// once the exact upstream contracts are confirmed.)

async function orChat(up: Upstream, body: Record<string, unknown>): Promise<any> {
  const r = await fetch(`${up.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${up.key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://mobii.world',
      'X-Title': 'Maverick Chat',
    },
    body: JSON.stringify({ model: up.model, ...body }),
  });
  if (!r.ok) throw new Error(`upstream ${r.status}: ${(await r.text()).slice(0, 160)}`);
  return r.json();
}

function extractImages(message: any): string[] {
  const imgs = message?.images ?? [];
  return imgs.map((im: any) => im?.image_url?.url ?? im?.url).filter(Boolean);
}

export interface MediaResult { text: string; media: string[] }

export async function generateImage(prompt: string, modelKey?: string): Promise<MediaResult> {
  const up = resolveImage(modelKey);
  if (!up) throw new Error('No image model configured');
  const data = await orChat(up, { messages: [{ role: 'user', content: prompt }], modalities: ['image', 'text'] });
  const msg = data?.choices?.[0]?.message ?? {};
  return { text: msg.content ?? '', media: extractImages(msg) };
}

export async function generateVideo(prompt: string, modelKey?: string): Promise<MediaResult> {
  const up = resolveVideo(modelKey);
  if (!up) throw new Error('No video model configured');
  const data = await orChat(up, { messages: [{ role: 'user', content: prompt }], modalities: ['video', 'text'] });
  const msg = data?.choices?.[0]?.message ?? {};
  const media = (msg?.videos ?? msg?.media ?? []).map((m: any) => m?.url ?? m?.video_url?.url).filter(Boolean);
  return { text: msg.content ?? '', media };
}

export async function generateSong(prompt: string, modelKey?: string): Promise<MediaResult> {
  const up = resolveSong(modelKey);
  if (!up) throw new Error('No song model configured');
  const data = await orChat(up, { messages: [{ role: 'user', content: prompt }], modalities: ['audio', 'text'] });
  const msg = data?.choices?.[0]?.message ?? {};
  const media = (msg?.audio ?? msg?.media ?? []).map((m: any) => m?.url ?? m?.audio_url?.url).filter(Boolean);
  return { text: msg.content ?? '', media };
}

/** Deep research using the configured research model + OpenRouter web search. */
export async function deepResearch(query: string): Promise<{ report: string }> {
  const up = resolveSystem('deepResearch');
  if (!up) throw new Error('No research model configured');
  const data = await orChat(up, {
    messages: [
      { role: 'system', content: 'You are a deep research assistant. Produce a thorough, well-structured, well-cited report with sources.' },
      { role: 'user', content: query },
    ],
    plugins: [{ id: 'web' }], // OpenRouter live web search
    max_tokens: 1800,
  });
  return { report: data?.choices?.[0]?.message?.content ?? '' };
}
