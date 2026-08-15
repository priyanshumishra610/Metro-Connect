import { ADMOB, APP_ENV } from '@/config/env';
import { loadAdsModule } from '@/lib/nativeAds';

/**
 * Development and staging always use Google's official test ad unit IDs
 * (react-native-google-mobile-ads ships them as `TestIds`) — production
 * only switches to real inventory when both APP_ENV=production and the
 * matching EXPO_PUBLIC_ADMOB_* var is actually set (brief §52). This means
 * a production build with unset AdMob env vars still safely falls back to
 * test ads instead of shipping a blank/broken ad slot.
 *
 * Hardcoded fallbacks below are Google's published sample test unit IDs
 * (public, not secrets) — used only if the native module can't even be
 * loaded (e.g. Expo Go), where ads won't render regardless of which ID
 * string is on file.
 */
const isProduction = APP_ENV === 'production';
const mod = loadAdsModule();

const testIds = {
  banner: mod?.TestIds.ADAPTIVE_BANNER ?? 'ca-app-pub-3940256099942544/9214589741',
  interstitial: mod?.TestIds.INTERSTITIAL ?? 'ca-app-pub-3940256099942544/1033173712',
  rewarded: mod?.TestIds.REWARDED ?? 'ca-app-pub-3940256099942544/5224354917',
};

export const adUnitIds = {
  banner: (isProduction && ADMOB.bannerId) || testIds.banner,
  interstitial: (isProduction && ADMOB.interstitialId) || testIds.interstitial,
  rewarded: (isProduction && ADMOB.rewardedId) || testIds.rewarded,
};

export const usingTestAds = !(isProduction && ADMOB.bannerId);
