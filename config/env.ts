export type AppEnv = 'development' | 'staging' | 'production';

const rawEnv = (process.env.EXPO_PUBLIC_APP_ENV as AppEnv | undefined) ?? 'development';

export const APP_ENV: AppEnv = ['development', 'staging', 'production'].includes(rawEnv)
  ? rawEnv
  : 'development';

export const IS_DEV = APP_ENV === 'development';

/**
 * Known-bad hostname typo that sent Google OAuth to a dead domain
 * (`supase.co` instead of `supabase.co`). Always rewrite it. Never hardcode
 * a typo domain anywhere else in the app.
 */
function sanitizeSupabaseUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  const corrected = trimmed.replace(/supase\.co/gi, 'supabase.co');
  try {
    const parsed = new URL(corrected);
    if (parsed.protocol !== 'https:') return '';
    const host = parsed.hostname.toLowerCase();
    if (host.includes('supase')) return '';
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return '';
  }
}

const rawSupabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_URL = sanitizeSupabaseUrl(rawSupabaseUrl);
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (__DEV__ && rawSupabaseUrl && rawSupabaseUrl !== SUPABASE_URL) {
  // eslint-disable-next-line no-console
  console.warn(
    '[env] EXPO_PUBLIC_SUPABASE_URL was corrected. It must be https://<project-ref>.supabase.co, never a typo host.'
  );
}

/**
 * True only when real Supabase credentials are present. Every service in
 * /services checks this (and guest mode via shouldUseLocalData) before
 * touching the network.
 */
export const HAS_SUPABASE_CONFIG = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/**
 * Ad unit IDs (per-placement — banner is the only one actually rendered
 * anywhere right now, see components/ads/AdBanner.tsx). The App ID itself
 * (one per platform, not per-placement) isn't read here — the native
 * module gets it from the manifest, which app.config.js sets from
 * EXPO_PUBLIC_ADMOB_ANDROID_APP_ID / EXPO_PUBLIC_ADMOB_IOS_APP_ID at build
 * time, not from JS at runtime.
 */
export const ADMOB = {
  bannerId: process.env.EXPO_PUBLIC_ADMOB_BANNER_ID ?? '',
  interstitialId: process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID ?? '',
  rewardedId: process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID ?? '',
};

/**
 * The Truecaller Client ID is embedded in the built app (it's how
 * Truecaller's app recognizes the caller, analogous to an OAuth client ID)
 * — not a secret. The Client SECRET used to exchange the auth code for a
 * token is a real secret and lives only in the Supabase Edge Function
 * (supabase/functions/truecaller-verify), never here.
 */
export const TRUECALLER_CLIENT_ID = process.env.EXPO_PUBLIC_TRUECALLER_CLIENT_ID ?? '';
export const HAS_TRUECALLER_CONFIG = Boolean(TRUECALLER_CLIENT_ID);
