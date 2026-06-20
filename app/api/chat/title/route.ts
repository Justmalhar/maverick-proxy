import { authenticate, json } from '../../../../lib/guard';
import { complete, recent, ChatMsg } from '../../../../lib/complete';
import { resolveSystem } from '../../../../config';

export const runtime = 'nodejs';

// POST { messages } → { title }  (short auto-title for a chat)
export async function POST(req: Request): Promise<Response> {
  const { error } = await authenticate(req);
  if (error) return error;

  let body: { messages?: ChatMsg[] };
  try { body = await req.json(); } catch { return json(400, 'Invalid JSON'); }
  if (!body.messages?.length) return json(400, 'Missing messages');

  const up = resolveSystem('chatTitle');
  if (!up) return json(500, 'No title model configured');

  try {
    const prompt: ChatMsg[] = [
      { role: 'system', content: 'You generate chat titles. Output ONLY the title — 3 to 6 words, Title Case, no quotes, no punctuation, no preamble, no explanation. Base it on the user\'s first request.' },
      ...recent(body.messages, 4),
      { role: 'user', content: 'Title:' },
    ];
    let title = await complete(up, prompt, 64, { disableReasoning: true });
    // Take the last non-empty line and strip wrapping quotes/markup/labels.
    title = (title.split('\n').map((l) => l.trim()).filter(Boolean).pop() ?? '')
      .replace(/^(title|chat title)\s*[:\-]\s*/i, '')
      .replace(/^["'#*\s]+|["'*\s]+$/g, '')
      .slice(0, 60);
    return Response.json({ title });
  } catch {
    return json(502, 'Title generation failed');
  }
}
