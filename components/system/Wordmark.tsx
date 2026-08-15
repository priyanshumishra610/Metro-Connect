import React from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { space } from '@/constants/spacing';

export function Wordmark({ size = 'large' }: { size?: 'large' | 'medium' }) {
  const variant = size === 'large' ? 'h1' : 'h3';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.interactive }} />
      <Text variant={variant} color="textPrimary">
        Metro <Text variant={variant} style={{ color: colors.interactive }}>Connect</Text>
      </Text>
    </View>
  );
}
