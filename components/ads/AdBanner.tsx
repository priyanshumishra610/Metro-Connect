import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { space } from '@/constants/spacing';
import { AdManager, type AdSurface } from '@/services/ads';

/**
 * The only place BannerAd gets rendered. Clearly labeled "Ad" (brief §53)
 * and refuses to mount at all on a surface AdManager marks ineligible —
 * screens don't need to know the placement rules themselves.
 */
export function AdBanner({ surface }: { surface: AdSurface }) {
  if (!AdManager.isBannerEligible(surface)) return null;

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
