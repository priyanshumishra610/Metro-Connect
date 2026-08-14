import { relevanceReasons } from '@/constants/copy';
import { HAS_SUPABASE_CONFIG } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { demoDiscoverRows } from '@/services/demoData';
import type { DiscoverCommuterRow, DiscoverDatingRow } from '@/types/database';
import { fail, fromSupabaseError, ok, type ServiceResult } from '@/utils/serviceResult';

const PAGE_SIZE = 20;

export interface DiscoveredPerson {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  profession: string | null;
  bio: string | null;
  isIdentityVerified: boolean;
  isCommuteVerified: boolean;
  startTime: string;
  reasons: string[];
}

function toDiscoveredPerson(row: DiscoverCommuterRow): DiscoveredPerson {
  const reasons: string[] = [];
  if (row.same_home_station && row.same_destination) reasons.push(relevanceReasons.highRouteOverlap);
  else if (row.same_home_station) reasons.push(relevanceReasons.sameHomeStation);
  else if (row.same_destination) reasons.push(relevanceReasons.sameDestination);
  if (row.same_line) reasons.push(relevanceReasons.sameLine);
  if (row.similar_time) reasons.push(relevanceReasons.similarTime);
  if (row.shared_interest_count > 0) reasons.push(relevanceReasons.sharedInterests(row.shared_interest_count));
  if (row.is_commute_verified) reasons.push(relevanceReasons.verified);

  return {
    userId: row.user_id,
    displayName: row.display_name ?? 'A fellow commuter',
    avatarUrl: row.avatar_url,
    profession: row.profession,
    bio: row.bio,
    isIdentityVerified: row.is_identity_verified,
    isCommuteVerified: row.is_commute_verified,
    startTime: row.start_time,
    reasons: reasons.slice(0, 3),
  };
}

/** People whose commute genuinely overlaps yours — the default "For You" / "Your Route" feed. Always bounded and paginated (brief §66). */
export async function discoverCommuters(userId: string, page = 0): Promise<ServiceResult<DiscoveredPerson[]>> {
  if (!HAS_SUPABASE_CONFIG) return ok(demoDiscoverRows().map(toDiscoveredPerson));

  const { data, error } = await supabase.rpc('discover_commuters', {
    requesting_user: userId,
    result_limit: PAGE_SIZE,
    result_offset: page * PAGE_SIZE,
  });

  if (error) return fail(fromSupabaseError(error).kind, error.message);
  return ok(((data ?? []) as DiscoverCommuterRow[]).map(toDiscoveredPerson));
}

export interface DatingProspect {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  isIdentityVerified: boolean;
  showCommuteTime: boolean;
  sharedInterestCount: number;
}

/** Dating Lobby pool — completely separate from discoverCommuters, only ever includes opted-in users (brief §32). */
export async function discoverDatingLobby(userId: string, page = 0): Promise<ServiceResult<DatingProspect[]>> {
  if (!HAS_SUPABASE_CONFIG) return ok([]);

  const { data, error } = await supabase.rpc('discover_dating_lobby', {
    requesting_user: userId,
    result_limit: PAGE_SIZE,
    result_offset: page * PAGE_SIZE,
  });

  if (error) return fail(fromSupabaseError(error).kind, error.message);
  return ok(
    ((data ?? []) as DiscoverDatingRow[]).map((row) => ({
      userId: row.user_id,
      displayName: row.display_name ?? 'A fellow commuter',
      avatarUrl: row.avatar_url,
      bio: row.bio,
      isIdentityVerified: row.is_identity_verified,
      showCommuteTime: row.show_commute_time,
      sharedInterestCount: row.shared_interest_count,
    }))
  );
}
