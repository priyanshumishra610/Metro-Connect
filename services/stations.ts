import { shouldUseLocalData } from '@/lib/dataMode';
import { supabase } from '@/lib/supabase';
import { DEMO_LINE, DEMO_STATIONS } from '@/services/demoData';
import type { MetroLine, Station } from '@/types/database';
import { fail, fromSupabaseError, ok, type ServiceResult } from '@/utils/serviceResult';

/** A station joined with its line's name/color — lets the picker disambiguate same-named interchange stations that live on different lines. */
export type StationWithLine = Station & { metro_lines: { name: string; color_hex: string } | null };

export async function listStationsForCity(cityId: string): Promise<ServiceResult<StationWithLine[]>> {
  if (shouldUseLocalData()) return ok(DEMO_STATIONS.map((s) => ({ ...s, metro_lines: { name: DEMO_LINE.name, color_hex: DEMO_LINE.color_hex } })));

  const { data, error } = await supabase
    .from('stations')
    .select('*, metro_lines(name, color_hex)')
    .eq('city_id', cityId)
    .eq('is_active', true)
    .order('sequence_number');

  if (error) return fail(fromSupabaseError(error).kind, error.message);
  return ok((data ?? []) as unknown as StationWithLine[]);
}

export async function searchStations(query: string, cityId?: string): Promise<ServiceResult<StationWithLine[]>> {
  if (shouldUseLocalData()) {
    const q = query.trim().toLowerCase();
    const matches = q ? DEMO_STATIONS.filter((s) => s.name.toLowerCase().includes(q)) : DEMO_STATIONS;
    return ok(matches.map((s) => ({ ...s, metro_lines: { name: DEMO_LINE.name, color_hex: DEMO_LINE.color_hex } })));
  }

  let request = supabase.from('stations').select('*, metro_lines(name, color_hex)').ilike('name', `%${query}%`).eq('is_active', true).limit(20);
  if (cityId) request = request.eq('city_id', cityId);

  const { data, error } = await request;
  if (error) return fail(fromSupabaseError(error).kind, error.message);
  return ok((data ?? []) as unknown as StationWithLine[]);
}

export async function listMetroLines(cityId: string): Promise<ServiceResult<MetroLine[]>> {
  if (shouldUseLocalData()) return ok([{ ...DEMO_LINE, metro_system_id: 'demo-system', created_at: '' }]);

  const { data, error } = await supabase
    .from('metro_lines')
    .select('*, metro_systems!inner(city_id)')
    .eq('metro_systems.city_id', cityId);

  if (error) return fail(fromSupabaseError(error).kind, error.message);
  return ok((data ?? []) as unknown as MetroLine[]);
}
