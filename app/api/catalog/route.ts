import { authenticate } from '../../../lib/guard';
import { publicCatalog } from '../../../config';

export const runtime = 'nodejs';

// GET → the full curated catalog (providers + models per modality) for the app UI.
export async function GET(req: Request): Promise<Response> {
  const { error } = await authenticate(req);
  if (error) return error;
  return Response.json(publicCatalog());
}
