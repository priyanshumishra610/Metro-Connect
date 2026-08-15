import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { space } from '@/constants/spacing';
import { loadAdsModule } from '@/lib/nativeAds';
import { AdManager, type AdSurface } from '@/services/ads';

/**
 * The only place BannerAd gets rendered. Clearly labeled "Ad" (brief §53)
 * and refuses to mount at all on a surface AdManager marks ineligible, or
 * when the native ads module isn't available (Expo Go) — screens don't
 * need to know either rule themselves.
 */
export function AdBanner({ surface }: { surface: AdSurface }) {
  const mod = loadAdsModule();
  if (!mod || !AdManager.isBannerEligible(surface)) return null;

  const { BannerAd, BannerAdSize } = mod;

  return (
    <View style={styles.wrapper}>
      <Text variant="caption" color="textSecondary" style={styles.label}>
        AD
      </Text>
      <BannerAd unitId={AdManager.bannerUnitId()} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', marginVertical: space.sm },
  label: { marginBottom: 2, letterSpacing: 1 },
});
