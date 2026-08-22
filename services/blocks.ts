import { shouldUseLocalData } from '@/lib/dataMode';
import { supabase } from '@/lib/supabase';
import { fail, fromSupabaseError, ok, type ServiceResult } from '@/utils/serviceResult';

export async function blockUser(blockerId: string, blockedId: string): Promise<ServiceResult<null>> {
  if (shouldUseLocalData()) return fail('guest_blocked');
  const { error } = await supabase.from('blocks').insert({ blocker_id: blockerId, blocked_id: blockedId });
  if (error) return fail(fromSupabaseError(error).kind, error.message);
  return ok(null);
}

export async function unblockUser(blockerId: string, blockedId: string): Promise<ServiceResult<null>> {
  if (shouldUseLocalData()) return fail('guest_blocked');
  const { error } = await supabase.from('blocks').delete().eq('blocker_id', blockerId).eq('blocked_id', blockedId);
  if (error) return fail(fromSupabaseError(error).kind, error.message);
  return ok(null);
}

export async function listBlockedUserIds(blockerId: string): Promise<ServiceResult<string[]>> {
  if (shouldUseLocalData()) return ok([]);
  const { data, error } = await supabase.from('blocks').select('blocked_id').eq('blocker_id', blockerId);
  if (error) return fail(fromSupabaseError(error).kind, error.message);
  return ok((data ?? []).map((r) => r.blocked_id));
}
