import { ToolLoopAgent, stepCountIs } from 'ai';
import { authenticate, json } from '../../../lib/guard';
import { consumeMessageQuota } from '../../../lib/quota';
import { orModel } from '../../../lib/provider';
import { agentTools } from '../../../lib/tools';
import { resolveLLM } from '../../../config';
import { bumpDailyUsage, meter } from '../../../lib/meter';

export const runtime = 'nodejs';
export const maxDuration = 300;

const INSTRUCTIONS = `You are Maverick, a capable AI assistant. You have tools to generate images, video, and songs, run deep web research, execute code, and create documents. Use a tool only when it genuinely helps; otherwise answer directly. Be concise.`;

// POST { model, messages } — agentic loop with tools, streamed back.
export async function POST(req: Request): Promise<Response> {
  const { ctx, error } = await authenticate(req);
  if (error) return error;

  const quota = await consumeMessageQuota(ctx!.uid);
  if (!quota.allowed) return json(429, quota.reason ?? 'Quota exceeded', { quota });

  let body: { model?: string; messages?: { role: string; content: string }[] };
  try { body = await req.json(); } catch { return json(400, 'Invalid JSON'); }
  if (!body.messages?.length) return json(400, 'Missing messages');

  const up = resolveLLM(body.model);
  if (!up) return json(500, 'No model configured');

  const agent = new ToolLoopAgent({
    model: orModel(up.model),
    instructions: INSTRUCTIONS,
    tools: agentTools,
    stopWhen: stepCountIs(12),
  });

  void bumpDailyUsage(ctx!.uid);
  void meter({ uid: ctx!.uid, kind: 'agent', model: up.model });

  const result = await agent.stream({ messages: body.messages as any });
  return result.toUIMessageStreamResponse();
}
