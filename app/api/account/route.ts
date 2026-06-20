import { authenticate, json } from '../../../lib/guard';
import { deleteAccount } from '../../../lib/supabase';

export const runtime = 'nodejs';

// DELETE → permanently delete the account (App Store requirement).
export async function DELETE(req: Request): Promise<Response> {
  const { ctx, error } = await authenticate(req);
  if (error) return error;
  await deleteAccount(ctx!.uid);
  return json(200, 'Account deleted');
}
