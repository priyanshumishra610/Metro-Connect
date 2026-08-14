import { HAS_SUPABASE_CONFIG } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { DEMO_LINE, DEMO_STATIONS } from '@/services/demoData';
import type { MetroLine, Station } from '@/types/database';
import { fail, fromSupabaseError, ok, type ServiceResult } from '@/utils/serviceResult';

export async function listStationsForCity(cityId: string): Promise<ServiceResult<Station[]>> {
  if (!HAS_SUPABASE_CONFIG) return ok(DEMO_STATIONS);

  const { data, error } = await supabase
    .from('stations')
    .select('*')
    .eq('city_id', cityId)
    .eq('is_active', true)
    .order('sequence_number');

  if (error) return fail(fromSupabaseError(error).kind, error.message);
  return ok((data ?? []) as Station[]);
}

export async function searchStations(query: string, cityId?: string): Promise<ServiceResult<Station[]>> {
  if (!HAS_SUPABASE_CONFIG) {
    const q = query.trim().toLowerCase();
    return ok(q ? DEMO_STATIONS.filter((s) => s.name.toLowerCase().includes(q)) : DEMO_STATIONS);
  }

  let request = supabase.from('stations').select('*').ilike('name', `%${query}%`).eq('is_active', true).limit(20);
  if (cityId) request = request.eq('city_id', cityId);

  const { data, error } = await request;
  if (error) return fail(fromSupabaseError(error).kind, error.message);
  return ok((data ?? []) as Station[]);
}

export async function listMetroLines(cityId: string): Promise<ServiceResult<MetroLine[]>> {
  if (!HAS_SUPABASE_CONFIG) return ok([{ ...DEMO_LINE, metro_system_id: 'demo-system', created_at: '' }]);

  const { data, error } = await supabase
    .from('metro_lines')
    .select('*, metro_systems!inner(city_id)')
    .eq('metro_systems.city_id', cityId);

  if (error) return fail(fromSupabaseError(error).kind, error.message);
  return ok((data ?? []) as unknown as MetroLine[]);
}
