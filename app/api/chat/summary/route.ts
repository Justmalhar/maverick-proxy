import { authenticate, json } from '../../../../lib/guard';
import { complete, recent, ChatMsg } from '../../../../lib/complete';
import { resolveSystem } from '../../../../config';

export const runtime = 'nodejs';

// POST { messages } → { summary }  (running summary injected as context)
export async function POST(req: Request): Promise<Response> {
  const { error } = await authenticate(req);
  if (error) return error;

  let body: { messages?: ChatMsg[] };
  try { body = await req.json(); } catch { return json(400, 'Invalid JSON'); }
  if (!body.messages?.length) return json(400, 'Missing messages');

  const up = resolveSystem('chatSummary');
  if (!up) return json(500, 'No summary model configured');

  try {
    const prompt: ChatMsg[] = [
      { role: 'system', content: 'Summarize the conversation so far in 2–4 sentences, capturing key facts, decisions, and the user’s goals. Write it as neutral context for continuing the chat. Reply with only the summary.' },
      ...recent(body.messages, 20),
    ];
    const summary = await complete(up, prompt, 220);
    return Response.json({ summary });
  } catch {
    return json(502, 'Summary generation failed');
  }
}
