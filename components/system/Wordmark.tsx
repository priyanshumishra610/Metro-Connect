import React from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { palette } from '@/constants/colors';
import { space } from '@/constants/spacing';

export function Wordmark({ size = 'large' }: { size?: 'large' | 'medium' }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: palette.blue }} />
      <Text variant={size === 'large' ? 'h1' : 'h3'} color="textPrimary">
        Metro <Text variant={size === 'large' ? 'h1' : 'h3'} style={{ color: palette.cyan }}>Connect</Text>
      </Text>
    </View>
  );
}
