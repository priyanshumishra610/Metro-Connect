import { TestIds } from 'react-native-google-mobile-ads';

import { ADMOB, APP_ENV } from '@/config/env';

/**
 * Development and staging always use Google's official test ad unit IDs
 * (react-native-google-mobile-ads ships them as `TestIds`) — production
 * only switches to real inventory when both APP_ENV=production and the
 * matching EXPO_PUBLIC_ADMOB_* var is actually set (brief §52). This means
 * a production build with unset AdMob env vars still safely falls back to
 * test ads instead of shipping a blank/broken ad slot.
 */
const isProduction = APP_ENV === 'production';

export const adUnitIds = {
  banner: (isProduction && ADMOB.bannerId) || TestIds.ADAPTIVE_BANNER,
  interstitial: (isProduction && ADMOB.interstitialId) || TestIds.INTERSTITIAL,
  rewarded: (isProduction && ADMOB.rewardedId) || TestIds.REWARDED,
};

export const usingTestAds = !(isProduction && ADMOB.bannerId);
