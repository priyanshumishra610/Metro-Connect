import { HAS_SUPABASE_CONFIG } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { DEMO_CITY } from '@/services/demoData';
import type { City } from '@/types/database';
import { fail, fromSupabaseError, ok, type ServiceResult } from '@/utils/serviceResult';

export async function listActiveCities(): Promise<ServiceResult<City[]>> {
  if (!HAS_SUPABASE_CONFIG) return ok([{ ...DEMO_CITY, is_active: true, created_at: '' }]);

  const { data, error } = await supabase.from('cities').select('*').eq('is_active', true).order('name');
  if (error) return fail(fromSupabaseError(error).kind, error.message);
  return ok((data ?? []) as City[]);
}
