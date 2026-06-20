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
      { role: 'system', content: 'Write a very short chat title: 3–6 words, Title Case, no quotes or punctuation. Reply with only the title.' },
      ...recent(body.messages, 4),
    ];
    let title = await complete(up, prompt, 24);
    title = title.replace(/^["'#\s]+|["'\s]+$/g, '').slice(0, 60);
    return Response.json({ title });
  } catch {
    return json(502, 'Title generation failed');
  }
}
