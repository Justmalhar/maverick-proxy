import { Upstream } from '../config';

export interface ChatMsg { role: string; content: string }

export interface CompleteOpts {
  /** Disable reasoning/thinking for utility calls (titles, summaries). */
  disableReasoning?: boolean;
}

/** Strip reasoning artifacts a hybrid model may emit inline in `content`. */
export function stripReasoning(text: string): string {
  return text
    // Remove closed <think>…</think> / <reasoning>…</reasoning> blocks.
    .replace(/<(think|reasoning|thought)>[\s\S]*?<\/\1>/gi, '')
    // Remove a dangling, unclosed <think> … (no closing tag) to end of string.
    .replace(/<(think|reasoning|thought)>[\s\S]*$/i, '')
    .trim();
}

/** One-shot (non-streaming) completion against an upstream. Returns the text. */
export async function complete(
  up: Upstream,
  messages: ChatMsg[],
  maxTokens = 256,
  opts: CompleteOpts = {},
): Promise<string> {
  const body: Record<string, unknown> = {
    model: up.model,
    messages,
    max_tokens: maxTokens,
    stream: false,
  };
  // OpenRouter unified flag: ask hybrid/reasoning models not to think and to
  // exclude reasoning tokens from the response, so `content` is the answer.
  if (opts.disableReasoning) {
    body.reasoning = { enabled: false, exclude: true };
  }

  const r = await fetch(`${up.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${up.key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://mobii.world',
      'X-Title': 'Maverick Chat',
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`upstream ${r.status}`);
  const data = await r.json();
  const content = data?.choices?.[0]?.message?.content ?? '';
  return stripReasoning(String(content)).trim();
}

/** Trim a message list to the last N for cheap title/summary calls. */
export function recent(messages: ChatMsg[], n: number): ChatMsg[] {
  return messages.filter((m) => m.role !== 'system').slice(-n);
}
