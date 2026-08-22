import type { Session, User } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

import { HAS_SUPABASE_CONFIG } from '@/config/env';
import { AUTH_COPY } from '@/lib/authErrors';
import { getAuthRedirectUri, getPasswordResetRedirectUri } from '@/lib/authRedirect';
import { supabase } from '@/lib/supabase';
import { track } from '@/services/analytics';
import { fail, fromSupabaseError, ok, type ServiceResult } from '@/utils/serviceResult';

WebBrowser.maybeCompleteAuthSession();

const EMAIL_MISMATCH = /invalid login|invalid credentials|user not found|email not confirmed/i;

export async function signUpWithEmail(email: string, password: string): Promise<ServiceResult<Session | null>> {
  if (!HAS_SUPABASE_CONFIG) return fail('not_configured', AUTH_COPY.connectingTrouble);
  track('signup_started');
  track('auth_started', { method: 'email' });
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    track('auth_failed', { method: 'email' });
    return fail('server_error', AUTH_COPY.connectingTrouble);
  }
  track('signup_completed');
  if (data.session) track('auth_succeeded', { method: 'email' });
  return ok(data.session);
}

export async function signInWithEmail(email: string, password: string): Promise<ServiceResult<Session>> {
  if (!HAS_SUPABASE_CONFIG) return fail('not_configured', AUTH_COPY.connectingTrouble);
  track('login_started');
  track('auth_started', { method: 'email' });
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    track('auth_failed', { method: 'email' });
    const raw = error?.message ?? '';
    if (EMAIL_MISMATCH.test(raw)) return fail('unauthorized', AUTH_COPY.emailMismatch);
    return fail(fromSupabaseError(error).kind, AUTH_COPY.connectingTrouble);
  }
  track('login_completed');
  track('auth_succeeded', { method: 'email' });
  return ok(data.session);
}

/**
 * Google Sign-In via Supabase's hosted OAuth flow. Google client secrets
 * live in the Supabase dashboard, never in this app. Redirect scheme comes
 * from app.config, and the resulting URL is rejected if it still contains
 * the `supase.co` typo domain.
 */
export async function signInWithGoogleOAuth(): Promise<ServiceResult<Session>> {
  if (!HAS_SUPABASE_CONFIG) {
    track('google_failed', { reason: 'not_configured' });
    return fail('not_configured', AUTH_COPY.connectingTrouble);
  }

  track('google_started');
  track('auth_started', { method: 'google' });

  const redirectTo = getAuthRedirectUri();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
      queryParams: { access_type: 'offline', prompt: 'select_account' },
    },
  });

  if (error || !data?.url) {
    track('google_failed', { reason: 'no_url' });
    track('auth_failed', { method: 'google' });
    return fail('server_error', AUTH_COPY.googleFailed);
  }

  if (data.url.includes('supase.co')) {
    track('google_failed', { reason: 'malformed_host' });
    track('auth_failed', { method: 'google' });
    return fail('server_error', AUTH_COPY.googleFailed);
  }

  if (Platform.OS === 'web') {
    window.location.assign(data.url);
    return fail('cancelled', AUTH_COPY.cancelled);
  }

  let browserResult: WebBrowser.WebBrowserAuthSessionResult;
  try {
    browserResult = await WebBrowser.openAuthSessionAsync(data.url, redirectTo, {
      showInRecents: true,
    });
  } catch {
    track('google_failed', { reason: 'browser' });
    track('auth_failed', { method: 'google' });
    return fail('offline', AUTH_COPY.connectingTrouble);
  }

  if (browserResult.type === 'cancel' || browserResult.type === 'dismiss') {
    track('google_cancelled');
    track('auth_cancelled', { method: 'google' });
    return fail('cancelled', AUTH_COPY.googleCancelled);
  }

  if (browserResult.type !== 'success' || !('url' in browserResult) || !browserResult.url) {
    track('google_failed', { reason: 'no_callback' });
    track('auth_failed', { method: 'google' });
    return fail('server_error', AUTH_COPY.googleFailed);
  }

  const sessionResult = await establishSessionFromUrl(browserResult.url);
  if (sessionResult.error) {
    track('google_failed', { reason: 'session' });
    track('auth_failed', { method: 'google' });
    return fail(sessionResult.error.kind === 'cancelled' ? 'cancelled' : 'server_error', sessionResult.error.kind === 'cancelled' ? AUTH_COPY.googleCancelled : AUTH_COPY.googleFailed);
  }

  track('google_succeeded');
  track('auth_succeeded', { method: 'google' });
  return sessionResult;
}

export async function establishSessionFromUrl(url: string): Promise<ServiceResult<Session>> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return fail('server_error', AUTH_COPY.googleFailed);
  }

  const params = new URLSearchParams(parsed.search);
  if (parsed.hash) {
    const hash = new URLSearchParams(parsed.hash.replace(/^#/, ''));
    hash.forEach((value, key) => {
      if (!params.has(key)) params.set(key, value);
    });
  }

  const errorCode = params.get('error') || params.get('error_code');
  if (errorCode) {
    if (errorCode === 'access_denied' || errorCode === 'user_cancelled') {
      return fail('cancelled', AUTH_COPY.googleCancelled);
    }
    return fail('server_error', AUTH_COPY.googleFailed);
  }

  const code = params.get('code');
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data.session) return fail('server_error', AUTH_COPY.googleFailed);
    return ok(data.session);
  }

  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  if (accessToken && refreshToken) {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error || !data.session) return fail('server_error', AUTH_COPY.googleFailed);
    return ok(data.session);
  }

  const { data } = await supabase.auth.getSession();
  if (data.session) return ok(data.session);

  return fail('server_error', AUTH_COPY.googleFailed);
}

export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/[^\d+]/g, '');
  if (!digits) return null;
  if (digits.startsWith('+') && digits.length >= 11 && digits.length <= 16) return digits;
  const only = digits.replace(/\D/g, '');
  if (only.length === 10) return `+91${only}`;
  if (only.length === 12 && only.startsWith('91')) return `+${only}`;
  if (only.length >= 11 && only.length <= 15) return `+${only}`;
  return null;
}

export async function sendPhoneOtp(phone: string): Promise<ServiceResult<{ phone: string }>> {
  if (!HAS_SUPABASE_CONFIG) return fail('not_configured', AUTH_COPY.connectingTrouble);
  const e164 = normalizePhone(phone);
  if (!e164) return fail('validation', 'Enter a valid phone number.');

  track('phone_started');
  track('auth_started', { method: 'phone' });

  const { error } = await supabase.auth.signInWithOtp({
    phone: e164,
    options: { channel: 'sms', shouldCreateUser: true },
  });

  if (error) {
    track('phone_failed', { reason: 'send' });
    track('auth_failed', { method: 'phone' });
    const raw = (error.message ?? '').toLowerCase();
    if (error.status === 429 || raw.includes('rate')) {
      return fail('rate_limited', AUTH_COPY.phoneRateLimited);
    }
    if (raw.includes('network') || raw.includes('fetch')) {
      return fail('offline', AUTH_COPY.phoneNetwork);
    }
    return fail('server_error', AUTH_COPY.phoneSendFailed);
  }

  track('phone_code_sent');
  return ok({ phone: e164 });
}

export async function verifyPhoneOtp(phone: string, token: string): Promise<ServiceResult<Session>> {
  if (!HAS_SUPABASE_CONFIG) return fail('not_configured', AUTH_COPY.connectingTrouble);
  const e164 = normalizePhone(phone);
  if (!e164) return fail('validation', 'Enter a valid phone number.');
  const code = token.replace(/\s/g, '');
  if (code.length < 4) return fail('validation', AUTH_COPY.phoneInvalid);

  const { data, error } = await supabase.auth.verifyOtp({
    phone: e164,
    token: code,
    type: 'sms',
  });

  if (error || !data.session) {
    track('phone_failed', { reason: 'verify' });
    const raw = (error?.message ?? '').toLowerCase();
    if (raw.includes('expired') || error?.code === 'otp_expired') {
      return fail('validation', AUTH_COPY.phoneExpired);
    }
    if (error?.status === 429 || raw.includes('rate')) {
      return fail('rate_limited', AUTH_COPY.phoneRateLimited);
    }
    if (raw.includes('network') || raw.includes('fetch')) {
      return fail('offline', AUTH_COPY.phoneNetwork);
    }
    return fail('validation', AUTH_COPY.phoneInvalid);
  }

  track('phone_verified');
  track('auth_succeeded', { method: 'phone' });
  return ok(data.session);
}

export async function signOut(): Promise<ServiceResult<null>> {
  if (!HAS_SUPABASE_CONFIG) return ok(null);
  const { error } = await supabase.auth.signOut();
  if (error) return fail(fromSupabaseError(error).kind, AUTH_COPY.connectingTrouble);
  return ok(null);
}

export async function sendPasswordReset(email: string): Promise<ServiceResult<null>> {
  if (!HAS_SUPABASE_CONFIG) return fail('not_configured', AUTH_COPY.connectingTrouble);
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getPasswordResetRedirectUri(),
  });
  if (error) return fail(fromSupabaseError(error).kind, AUTH_COPY.connectingTrouble);
  return ok(null);
}

export async function updatePassword(newPassword: string): Promise<ServiceResult<null>> {
  if (!HAS_SUPABASE_CONFIG) return fail('not_configured', AUTH_COPY.connectingTrouble);
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return fail(fromSupabaseError(error).kind, AUTH_COPY.connectingTrouble);
  return ok(null);
}

export async function getSession(): Promise<Session | null> {
  if (!HAS_SUPABASE_CONFIG) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthStateChange(callback: (event: string, session: Session | null) => void) {
  if (!HAS_SUPABASE_CONFIG) return { unsubscribe: () => undefined };
  const { data } = supabase.auth.onAuthStateChange((event, session) => callback(event, session));
  return data.subscription;
}

/**
 * Linking is allowed only on verified email or phone from the provider.
 * Display names are never used as a merge key.
 */
export function verifiedIdentitySignals(user: User): { email?: string; phone?: string } {
  const email = user.email && user.email_confirmed_at ? user.email : undefined;
  const phone = user.phone && user.phone_confirmed_at ? user.phone : undefined;
  return { email, phone };
}
