import { HAS_SUPABASE_CONFIG } from '@/config/env';
import { supabase } from '@/lib/supabase';
import type { DatingPreference } from '@/types/database';
import { fail, fromSupabaseError, ok, type ServiceResult } from '@/utils/serviceResult';

export async function getDatingPreferences(userId: string): Promise<ServiceResult<DatingPreference | null>> {
  if (!HAS_SUPABASE_CONFIG) return ok(null);
  const { data, error } = await supabase.from('dating_preferences').select('*').eq('user_id', userId).maybeSingle();
  if (error) return fail(fromSupabaseError(error).kind, error.message);
  return ok(data as DatingPreference | null);
}

export async function optIntoDatingLobby(userId: string): Promise<ServiceResult<null>> {
  if (!HAS_SUPABASE_CONFIG) return fail('not_configured');
  const { error } = await supabase
    .from('dating_preferences')
    .upsert({ user_id: userId, is_opted_in: true, show_in_lobby: true }, { onConflict: 'user_id' });
  if (error) return fail(fromSupabaseError(error).kind, error.message);
  return ok(null);
}

export async function leaveDatingLobby(userId: string): Promise<ServiceResult<null>> {
  if (!HAS_SUPABASE_CONFIG) return fail('not_configured');
  const { error } = await supabase
    .from('dating_preferences')
    .update({ is_opted_in: false, show_in_lobby: false })
    .eq('user_id', userId);
  if (error) return fail(fromSupabaseError(error).kind, error.message);
  return ok(null);
}

export async function setDatingLobbyVisibility(userId: string, showInLobby: boolean): Promise<ServiceResult<null>> {
  if (!HAS_SUPABASE_CONFIG) return fail('not_configured');
  const { error } = await supabase.from('dating_preferences').update({ show_in_lobby: showInLobby }).eq('user_id', userId);
  if (error) return fail(fromSupabaseError(error).kind, error.message);
  return ok(null);
}
