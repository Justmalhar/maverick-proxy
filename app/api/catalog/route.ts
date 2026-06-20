import { publicCatalog } from '../../../config';

export const runtime = 'nodejs';

// GET → the curated catalog (providers + models per modality) for the app UI.
// Public: it's just model labels/aliases, no secrets — so the app can show the
// real lineup before the user signs in.
export async function GET(): Promise<Response> {
  return Response.json(publicCatalog(), {
    headers: { 'Cache-Control': 'public, max-age=300' },
  });
}
