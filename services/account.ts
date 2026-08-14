import { HAS_SUPABASE_CONFIG } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { track } from '@/services/analytics';
import { signOut } from '@/services/auth';
import { fail, fromSupabaseError, ok, type ServiceResult } from '@/utils/serviceResult';

/**
 * Account deletion (brief §39) is two steps by design:
 *  1. anonymize_own_account() — runs now, with the user's own session,
 *     strips personal data and detaches active connections.
 *  2. Deleting the actual auth.users row requires the Supabase Admin API
 *     (a service-role key), which this app must never hold (§13, §15, §82).
 *     Wire that up as a server-side function (Supabase Edge Function or your
 *     own backend) that calls `supabase.auth.admin.deleteUser(userId)`, and
 *     call it from here once that endpoint exists — see
 *     docs/SUPABASE_SETUP.md.
 */
export async function deleteAccount(): Promise<ServiceResult<null>> {
  if (!HAS_SUPABASE_CONFIG) return fail('not_configured');

  const { error } = await supabase.rpc('anonymize_own_account');
  if (error) return fail(fromSupabaseError(error).kind, error.message);

  track('account_deleted');
  await signOut();
  return ok(null);
}
