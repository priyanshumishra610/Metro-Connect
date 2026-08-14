import { HAS_SUPABASE_CONFIG } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { track } from '@/services/analytics';
import type { CommuteFrequency, CommutePreference } from '@/types/database';
import { fail, fromSupabaseError, ok, type ServiceResult } from '@/utils/serviceResult';

export interface CommuteInput {
  homeStationId: string;
  destinationStationId: string;
  metroLineId: string;
  startTime: string; // "HH:MM"
  endTime: string;
  daysOfWeek: number[];
  frequency: CommuteFrequency;
}

export async function getPrimaryCommute(userId: string): Promise<ServiceResult<CommutePreference | null>> {
  if (!HAS_SUPABASE_CONFIG) return ok(null);

  const { data, error } = await supabase
    .from('commute_preferences')
    .select('*')
    .eq('user_id', userId)
    .eq('is_primary', true)
    .eq('is_active', true)
    .maybeSingle();

  if (error) return fail(fromSupabaseError(error).kind, error.message);
  return ok(data as CommutePreference | null);
}

export interface CommuteWithStations extends CommutePreference {
  home_station: { name: string } | null;
  destination_station: { name: string } | null;
}

export async function getPrimaryCommuteWithStations(userId: string): Promise<ServiceResult<CommuteWithStations | null>> {
  if (!HAS_SUPABASE_CONFIG) return ok(null);

  const { data, error } = await supabase
    .from('commute_preferences')
    .select('*, home_station:stations!commute_preferences_home_station_id_fkey(name), destination_station:stations!commute_preferences_destination_station_id_fkey(name)')
    .eq('user_id', userId)
    .eq('is_primary', true)
    .eq('is_active', true)
    .maybeSingle();

  if (error) return fail(fromSupabaseError(error).kind, error.message);
  return ok(data as unknown as CommuteWithStations | null);
}

export async function saveCommute(userId: string, input: CommuteInput): Promise<ServiceResult<CommutePreference>> {
  if (!HAS_SUPABASE_CONFIG) return fail('not_configured');
  if (input.homeStationId === input.destinationStationId) {
    return fail('validation', 'Your start and destination can\'t be the same station.');
  }

  const { data, error } = await supabase
    .from('commute_preferences')
    .upsert(
      {
        user_id: userId,
        direction: 'outbound',
        home_station_id: input.homeStationId,
        destination_station_id: input.destinationStationId,
        metro_line_id: input.metroLineId,
        start_time: `${input.startTime}:00`,
        end_time: `${input.endTime}:00`,
        days_of_week: input.daysOfWeek,
        frequency: input.frequency,
        is_primary: true,
        is_active: true,
      },
      { onConflict: 'user_id,direction' }
    )
    .select('*')
    .single();

  if (error) return fail(fromSupabaseError(error).kind, error.message);
  track('commute_created');
  return ok(data as CommutePreference);
}
