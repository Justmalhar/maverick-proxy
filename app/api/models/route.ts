import { authenticate } from '../../../lib/guard';
import { enabledLLM } from '../../../config';

export const runtime = 'nodejs';

// GET → curated LLM models (OpenAI-compatible shape). Full multi-modality
// catalog is at /api/catalog.
export async function GET(req: Request): Promise<Response> {
  const { error } = await authenticate(req);
  if (error) return error;
  return Response.json({
    data: enabledLLM().map((m) => ({ id: m.id, name: m.label })),
  });
}
