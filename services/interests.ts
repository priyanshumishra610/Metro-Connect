import { interestCatalog } from '@/constants/interests';
import { HAS_SUPABASE_CONFIG } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { track } from '@/services/analytics';
import type { Interest } from '@/types/database';
import { fail, fromSupabaseError, ok, type ServiceResult } from '@/utils/serviceResult';

export async function listInterests(): Promise<ServiceResult<Interest[]>> {
  if (!HAS_SUPABASE_CONFIG) {
    return ok(interestCatalog.map((i) => ({ id: i.slug, slug: i.slug, label: i.label, category: i.category, created_at: '' })));
  }

  const { data, error } = await supabase.from('interests').select('*').order('label');
  if (error) return fail(fromSupabaseError(error).kind, error.message);
  return ok((data ?? []) as Interest[]);
}

export async function getUserInterestIds(userId: string): Promise<ServiceResult<string[]>> {
  if (!HAS_SUPABASE_CONFIG) return ok([]);

  const { data, error } = await supabase.from('user_interests').select('interest_id').eq('user_id', userId);
  if (error) return fail(fromSupabaseError(error).kind, error.message);
  return ok((data ?? []).map((r) => r.interest_id));
}

/** Replaces the user's full interest set in one call — simplest mental model for an onboarding step and a later edit screen alike. */
export async function setUserInterests(userId: string, interestIds: string[]): Promise<ServiceResult<null>> {
  if (!HAS_SUPABASE_CONFIG) return fail('not_configured');

  const { error: deleteError } = await supabase.from('user_interests').delete().eq('user_id', userId);
  if (deleteError) return fail(fromSupabaseError(deleteError).kind, deleteError.message);

  if (interestIds.length > 0) {
    const { error: insertError } = await supabase
      .from('user_interests')
      .insert(interestIds.map((interest_id) => ({ user_id: userId, interest_id })));
    if (insertError) return fail(fromSupabaseError(insertError).kind, insertError.message);
  }

  interestIds.forEach(() => track('interest_selected'));
  return ok(null);
}
