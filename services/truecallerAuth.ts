import { Platform } from 'react-native';
import type { Session } from '@supabase/supabase-js';

import { HAS_SUPABASE_CONFIG, HAS_TRUECALLER_CONFIG } from '@/config/env';
import { AUTH_COPY } from '@/lib/authErrors';
import { loadTruecallerModule } from '@/lib/nativeTruecaller';
import { supabase } from '@/lib/supabase';
import { track } from '@/services/analytics';
import { fail, ok, type ServiceResult } from '@/utils/serviceResult';

export type TruecallerAvailability = 'ready' | 'unavailable' | 'unsupported';

/**
 * Android-only. Truecaller's iOS SDK is too limited, so iOS keeps
 * Google / Phone / Guest. Usability is checked before any SDK UI.
 */
export function isTruecallerOffered(): boolean {
  return Platform.OS === 'android' && HAS_TRUECALLER_CONFIG;
}

export async function getTruecallerAvailability(): Promise<TruecallerAvailability> {
  if (Platform.OS !== 'android') return 'unsupported';
  const mod = loadTruecallerModule();
  if (!mod) return 'unavailable';
  try {
    const usable = await mod.trueCallerService.isUsable();
    return usable ? 'ready' : 'unavailable';
  } catch {
    return 'unavailable';
  }
}

export async function signInWithTruecaller(): Promise<ServiceResult<Session | { unavailable: true }>> {
  if (!HAS_SUPABASE_CONFIG) return fail('not_configured', AUTH_COPY.connectingTrouble);

  track('truecaller_started');
  track('auth_started', { method: 'truecaller' });

  const availability = await getTruecallerAvailability();
  if (availability !== 'ready') {
    track('truecaller_unavailable');
    track('truecaller_fallback_shown');
    return ok({ unavailable: true });
  }

  const mod = loadTruecallerModule();
  if (!mod) {
    track('truecaller_unavailable');
    track('truecaller_fallback_shown');
    return ok({ unavailable: true });
  }

  let oauthData: { authorizationCode: string; codeVerifier: string };
  try {
    const result = await mod.trueCallerService.authenticate(['profile', 'phone']);
    oauthData = { authorizationCode: result.authorizationCode, codeVerifier: result.codeVerifier };
  } catch {
    track('truecaller_failed', { reason: 'sdk' });
    track('auth_failed', { method: 'truecaller' });
    return fail('server_error', AUTH_COPY.truecallerFailed);
  }

  const { data: fnData, error: fnError } = await supabase.functions.invoke('truecaller-verify', {
    body: oauthData,
  });
  if (fnError || !fnData?.access_token || !fnData?.refresh_token) {
    track('truecaller_failed', { reason: 'verify' });
    track('auth_failed', { method: 'truecaller' });
    return fail('server_error', AUTH_COPY.truecallerFailed);
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
    access_token: fnData.access_token,
    refresh_token: fnData.refresh_token,
  });
  if (sessionError || !sessionData.session) {
    track('truecaller_failed', { reason: 'session' });
    track('auth_failed', { method: 'truecaller' });
    return fail('server_error', AUTH_COPY.truecallerFailed);
  }

  track('truecaller_succeeded');
  track('auth_succeeded', { method: 'truecaller' });
  return ok(sessionData.session);
}
