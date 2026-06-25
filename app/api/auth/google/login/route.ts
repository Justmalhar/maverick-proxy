import { buildAuthUrl } from '../../../../../lib/googleOAuth';

export const runtime = 'nodejs';

// GET /api/auth/google/login?state=<random>
// Redirects the user's browser to Google's OAuth consent page.
// Called by the Electron app via shell.openExternal().
export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const state = searchParams.get('state') ?? '';
  if (!state) return new Response('Missing state', { status: 400 });

  let url: string;
  try {
    url = buildAuthUrl(state);
  } catch (e) {
    return new Response((e as Error).message, { status: 500 });
  }

  return Response.redirect(url, 302);
}
