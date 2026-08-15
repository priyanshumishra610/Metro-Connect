import type { Session } from '@supabase/supabase-js';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

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
 * Google Sign-In via Supabase's hosted OAuth flow: open a browser session
 * at the Google consent screen (through Supabase, which brokers the actual
 * Google OAuth client credentials — those live in the Supabase dashboard,
 * never in this app, per brief §13/§82), capture the redirect back into the
 * app, then exchange the returned code for a session. No native Google SDK
 * needed, so this works in Expo Go as well as a dev client/production
 * build — see docs/SUPABASE_SETUP.md for the one-time dashboard setup this
 * depends on.
 */
export async function signInWithGoogleOAuth(): Promise<ServiceResult<Session>> {
  if (!HAS_SUPABASE_CONFIG) return fail('not_configured');

  const redirectTo = makeRedirectUri({ path: 'auth-callback' });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error || !data?.url) return fail(fromSupabaseError(error).kind, error?.message);

  const browserResult = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (browserResult.type !== 'success' || !browserResult.url) {
    return fail('validation', 'Google sign-in was cancelled.');
  }

  const code = new URL(browserResult.url).searchParams.get('code');
  if (!code) return fail('server_error', "Google sign-in didn't return a code.");

  const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError || !sessionData.session) {
    return fail(fromSupabaseError(exchangeError).kind, exchangeError?.message);
  }

  return ok(sessionData.session);
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
