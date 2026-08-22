import { shouldUseLocalData } from '@/lib/dataMode';
import { supabase } from '@/lib/supabase';
import { createGuestProfile, demoPersonToProfile, getDemoPerson, GUEST_PROFILE_ID } from '@/services/demoData';
import type { Profile } from '@/types/database';
import { fail, fromSupabaseError, ok, type ServiceResult } from '@/utils/serviceResult';

export interface ProfileUpdateInput {
  username?: string;
  display_name?: string;
  bio?: string;
  profession?: string;
  education?: string;
  city_id?: string;
  avatar_url?: string;
}

export async function getProfile(userId: string): Promise<ServiceResult<Profile | null>> {
  if (shouldUseLocalData()) {
    if (userId === GUEST_PROFILE_ID) return ok(createGuestProfile());
    const person = getDemoPerson(userId);
    if (person) return ok(demoPersonToProfile(person));
    return ok(null);
  }
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) return fail(fromSupabaseError(error).kind, fromSupabaseError(error).message);
  return ok(data as Profile | null);
}

/** Bio is capped at 280 chars by a DB check constraint; validate client-side too so the error reads as ours, not Postgres's. */
export async function updateProfile(userId: string, input: ProfileUpdateInput): Promise<ServiceResult<Profile>> {
  if (shouldUseLocalData()) return fail('guest_blocked', 'A permanent profile needs an account.');
  if (input.bio && input.bio.length > 280) {
    return fail('validation', 'Bio needs to be 280 characters or fewer.');
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(input)
    .eq('id', userId)
    .select('*')
    .single();

  if (error) return fail(fromSupabaseError(error).kind, fromSupabaseError(error).message);
  return ok(data as Profile);
}

export async function markProfileComplete(userId: string): Promise<ServiceResult<null>> {
  if (shouldUseLocalData()) return fail('guest_blocked');
  const { error } = await supabase.from('profiles').update({ is_profile_complete: true }).eq('id', userId);
  if (error) return fail(fromSupabaseError(error).kind, fromSupabaseError(error).message);
  return ok(null);
}

export async function uploadAvatar(userId: string, fileUri: string, contentType: string): Promise<ServiceResult<string>> {
  if (shouldUseLocalData()) return fail('guest_blocked', 'A permanent profile needs an account.');

  const extension = contentType.split('/')[1] ?? 'jpg';
  const path = `${userId}/avatar-${Date.now()}.${extension}`;

  const response = await fetch(fileUri);
  const blob = await response.blob();

  if (blob.size > 5 * 1024 * 1024) {
    return fail('validation', 'That image is larger than 5MB. Try a smaller one.');
  }

  const { error: uploadError } = await supabase.storage.from('avatars').upload(path, blob, {
    contentType,
    upsert: true,
  });
  if (uploadError) return fail(fromSupabaseError(uploadError).kind, fromSupabaseError(uploadError).message);

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return ok(data.publicUrl);
}
