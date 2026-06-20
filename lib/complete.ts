import { Upstream } from '../config';

export interface ChatMsg { role: string; content: string }

/** One-shot (non-streaming) completion against an upstream. Returns the text. */
export async function complete(up: Upstream, messages: ChatMsg[], maxTokens = 256): Promise<string> {
  const r = await fetch(`${up.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${up.key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://mobii.world',
      'X-Title': 'Maverick Chat',
    },
    body: JSON.stringify({ model: up.model, messages, max_tokens: maxTokens, stream: false }),
  });
  if (!r.ok) throw new Error(`upstream ${r.status}`);
  const data = await r.json();
  return (data?.choices?.[0]?.message?.content ?? '').trim();
}

/** Trim a message list to the last N for cheap title/summary calls. */
export function recent(messages: ChatMsg[], n: number): ChatMsg[] {
  return messages.filter((m) => m.role !== 'system').slice(-n);
}
