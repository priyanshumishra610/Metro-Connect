import type { Session } from '@supabase/supabase-js';

import { HAS_SUPABASE_CONFIG } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { fail, fromSupabaseError, ok, type ServiceResult } from '@/utils/serviceResult';

export async function signUpWithEmail(email: string, password: string): Promise<ServiceResult<Session | null>> {
  if (!HAS_SUPABASE_CONFIG) return fail('not_configured');
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return fail(fromSupabaseError(error).kind, error.message);
  return ok(data.session);
}

export async function signInWithEmail(email: string, password: string): Promise<ServiceResult<Session>> {
  if (!HAS_SUPABASE_CONFIG) return fail('not_configured');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) return fail(fromSupabaseError(error).kind, error?.message);
  return ok(data.session);
}

/**
 * Google Sign-In needs a native OAuth flow (expo-auth-session or
 * @react-native-google-signin/google-signin) wired to a Google OAuth client
 * ID, which is a per-project credential the brief says not to invent
 * (§13, §82). This function performs the Supabase half of the exchange —
 * swap `idToken` for the one the native flow returns once that package and
 * its client IDs are configured.
 */
export async function signInWithGoogleIdToken(idToken: string): Promise<ServiceResult<Session>> {
  if (!HAS_SUPABASE_CONFIG) return fail('not_configured');
  const { data, error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: idToken });
  if (error || !data.session) return fail(fromSupabaseError(error).kind, error?.message);
  return ok(data.session);
}

export async function signOut(): Promise<ServiceResult<null>> {
  if (!HAS_SUPABASE_CONFIG) return ok(null);
  const { error } = await supabase.auth.signOut();
  if (error) return fail(fromSupabaseError(error).kind, error.message);
  return ok(null);
}

export async function sendPasswordReset(email: string): Promise<ServiceResult<null>> {
  if (!HAS_SUPABASE_CONFIG) return fail('not_configured');
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'metroconnect://reset-password',
  });
  if (error) return fail(fromSupabaseError(error).kind, error.message);
  return ok(null);
}

export async function updatePassword(newPassword: string): Promise<ServiceResult<null>> {
  if (!HAS_SUPABASE_CONFIG) return fail('not_configured');
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return fail(fromSupabaseError(error).kind, error.message);
  return ok(null);
}

export async function getSession(): Promise<Session | null> {
  if (!HAS_SUPABASE_CONFIG) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthStateChange(callback: (session: Session | null) => void) {
  if (!HAS_SUPABASE_CONFIG) return { unsubscribe: () => {} };
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return data.subscription;
}
