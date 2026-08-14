import { HAS_SUPABASE_CONFIG } from '@/config/env';
import { supabase } from '@/lib/supabase';
import type { Community } from '@/types/database';
import { fail, fromSupabaseError, ok, type ServiceResult } from '@/utils/serviceResult';

export interface CommunityWithCount extends Community {
  member_count: number;
}

/** "47 commuters on nearby routes are into AI" — never a raw global follower count (brief §30). */
export async function listCommunitiesForCity(cityId: string): Promise<ServiceResult<CommunityWithCount[]>> {
  if (!HAS_SUPABASE_CONFIG) return ok([]);

  const { data, error } = await supabase
    .from('communities')
    .select('*, community_members(count)')
    .eq('city_id', cityId);

  if (error) return fail(fromSupabaseError(error).kind, error.message);

  return ok(
    (data ?? []).map((row: any) => ({
      ...row,
      member_count: row.community_members?.[0]?.count ?? 0,
    }))
  );
}

export async function joinCommunity(communityId: string, userId: string): Promise<ServiceResult<null>> {
  if (!HAS_SUPABASE_CONFIG) return fail('not_configured');
  const { error } = await supabase.from('community_members').insert({ community_id: communityId, user_id: userId });
  if (error) return fail(fromSupabaseError(error).kind, error.message);
  return ok(null);
}

export async function leaveCommunity(communityId: string, userId: string): Promise<ServiceResult<null>> {
  if (!HAS_SUPABASE_CONFIG) return fail('not_configured');
  const { error } = await supabase.from('community_members').delete().eq('community_id', communityId).eq('user_id', userId);
  if (error) return fail(fromSupabaseError(error).kind, error.message);
  return ok(null);
}
