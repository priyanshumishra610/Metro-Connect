export type AppEnv = 'development' | 'staging' | 'production';

const rawEnv = (process.env.EXPO_PUBLIC_APP_ENV as AppEnv | undefined) ?? 'development';

export const APP_ENV: AppEnv = ['development', 'staging', 'production'].includes(rawEnv)
  ? rawEnv
  : 'development';

export const IS_DEV = APP_ENV === 'development';

export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/**
 * True only when real Supabase credentials are present. Every service in
 * /services checks this before touching the network so the app can boot
 * (and demo) with `.env` unset, per brief §82 — never invent credentials,
 * never claim a live integration that isn't configured.
 */
export const HAS_SUPABASE_CONFIG = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const ADMOB = {
  appId: process.env.EXPO_PUBLIC_ADMOB_APP_ID ?? '',
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
