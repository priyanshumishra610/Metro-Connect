import { Platform } from 'react-native';
import type { Session } from '@supabase/supabase-js';

import { HAS_SUPABASE_CONFIG } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { loadTruecallerModule } from '@/lib/nativeTruecaller';
import { fail, fromSupabaseError, ok, type ServiceResult } from '@/utils/serviceResult';

/**
 * Android-only by design (per product decision) — Truecaller's iOS SDK is
 * far more limited, so iOS keeps Google/email as its only sign-in paths.
 * Every native call here is individually try/caught on top of the already-
 * guarded loadTruecallerModule() (see lib/nativeTruecaller.ts) — that file
 * explains a real bug found in this package's New Architecture code path
 * that couldn't be verified without a physical device.
 */
export function isTruecallerAvailable(): boolean {
  return Platform.OS === 'android' && loadTruecallerModule() !== null;
}

export async function signInWithTruecaller(): Promise<ServiceResult<Session>> {
  if (!HAS_SUPABASE_CONFIG) return fail('not_configured');

  const mod = loadTruecallerModule();
  if (!mod) return fail('not_configured', 'Truecaller sign-in is unavailable on this build.');

  let oauthData: { authorizationCode: string; codeVerifier: string };
  try {
    const usable = await mod.trueCallerService.isUsable();
    if (!usable) return fail('validation', 'Truecaller is not usable on this device — is the app installed?');

    const result = await mod.trueCallerService.authenticate(['profile', 'phone']);
    oauthData = { authorizationCode: result.authorizationCode, codeVerifier: result.codeVerifier };
  } catch (error) {
    return fail('server_error', 'Truecaller sign-in failed. Try email or Google instead.', error);
  }

  const { data: fnData, error: fnError } = await supabase.functions.invoke('truecaller-verify', {
    body: oauthData,
  });
  if (fnError || !fnData?.access_token || !fnData?.refresh_token) {
    return fail('server_error', "Couldn't verify your number. Try email or Google instead.", fnError);
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
    access_token: fnData.access_token,
    refresh_token: fnData.refresh_token,
  });
  if (sessionError || !sessionData.session) {
    return fail(fromSupabaseError(sessionError).kind, sessionError?.message);
  }

  return ok(sessionData.session);
}
