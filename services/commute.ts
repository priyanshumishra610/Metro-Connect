import { shouldUseLocalData } from '@/lib/dataMode';
import { supabase } from '@/lib/supabase';
import { track } from '@/services/analytics';
import {
  DEMO_LINE,
  DEMO_STATIONS,
  getDemoPerson,
  GUEST_PROFILE_ID,
  isDemoPersonId,
  stationName,
} from '@/services/demoData';
import type { CommuteFrequency, CommutePreference } from '@/types/database';
import { fail, fromSupabaseError, ok, type ServiceResult } from '@/utils/serviceResult';

export interface CommuteInput {
  homeStationId: string;
  destinationStationId: string;
  metroLineId: string;
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
  frequency: CommuteFrequency;
}

export interface CommuteWithStations extends CommutePreference {
  home_station: { name: string } | null;
  destination_station: { name: string } | null;
  metro_line: { color_hex: string } | null;
}

function demoCommuteForUser(userId: string): CommuteWithStations | null {
  if (userId === GUEST_PROFILE_ID) {
    return {
      id: 'demo-commute-guest',
      user_id: userId,
      direction: 'outbound',
      home_station_id: DEMO_STATIONS[0].id,
      destination_station_id: DEMO_STATIONS[1].id,
      metro_line_id: DEMO_LINE.id,
      start_time: '08:00:00',
      end_time: '09:00:00',
      days_of_week: [1, 2, 3, 4, 5],
      frequency: 'weekdays',
      is_primary: true,
      is_active: true,
      created_at: '',
      updated_at: '',
      home_station: { name: stationName(DEMO_STATIONS[0].id) },
      destination_station: { name: stationName(DEMO_STATIONS[1].id) },
      metro_line: { color_hex: DEMO_LINE.color_hex },
    };
  }
  const person = getDemoPerson(userId);
  if (!person || !isDemoPersonId(userId)) return null;
  return {
    id: `demo-commute-${person.id}`,
    user_id: person.id,
    direction: 'outbound',
    home_station_id: person.homeStationId,
    destination_station_id: person.destinationStationId,
    metro_line_id: DEMO_LINE.id,
    start_time: person.startTime,
    end_time: '09:00:00',
    days_of_week: [1, 2, 3, 4, 5],
    frequency: 'weekdays',
    is_primary: true,
    is_active: true,
    created_at: '',
    updated_at: '',
    home_station: { name: stationName(person.homeStationId) },
    destination_station: { name: stationName(person.destinationStationId) },
    metro_line: { color_hex: DEMO_LINE.color_hex },
  };
}

export async function getPrimaryCommute(userId: string): Promise<ServiceResult<CommutePreference | null>> {
  if (shouldUseLocalData()) {
    const demo = demoCommuteForUser(userId);
    return ok(demo);
  }

  const { data, error } = await supabase
    .from('commute_preferences')
    .select('*')
    .eq('user_id', userId)
    .eq('is_primary', true)
    .eq('is_active', true)
    .maybeSingle();

  if (error) return fail(fromSupabaseError(error).kind, fromSupabaseError(error).message);
  return ok(data as CommutePreference | null);
}

export async function getPrimaryCommuteWithStations(userId: string): Promise<ServiceResult<CommuteWithStations | null>> {
  if (shouldUseLocalData()) return ok(demoCommuteForUser(userId));

  const { data, error } = await supabase
    .from('commute_preferences')
    .select(
      '*, home_station:stations!commute_preferences_home_station_id_fkey(name), destination_station:stations!commute_preferences_destination_station_id_fkey(name), metro_line:metro_lines(color_hex)'
    )
    .eq('user_id', userId)
    .eq('is_primary', true)
    .eq('is_active', true)
    .maybeSingle();

  if (error) return fail(fromSupabaseError(error).kind, fromSupabaseError(error).message);
  return ok(data as unknown as CommuteWithStations | null);
}

export async function saveCommute(userId: string, input: CommuteInput): Promise<ServiceResult<CommutePreference>> {
  if (shouldUseLocalData()) return fail('guest_blocked', 'Saving a real commute needs an account.');
  if (input.homeStationId === input.destinationStationId) {
    return fail('validation', "Your start and destination can't be the same station.");
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

  if (error) return fail(fromSupabaseError(error).kind, fromSupabaseError(error).message);
  track('commute_created');
  return ok(data as CommutePreference);
}
