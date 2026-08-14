import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, palette } from '@/constants/colors';

const RING_COLORS = [palette.blue, palette.cyan, palette.orange, palette.green, palette.pink, palette.yellow];

function colorForSeed(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return RING_COLORS[hash % RING_COLORS.length];
}

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.length === 1 ? parts[0].slice(0, 2).toUpperCase() : (parts[0][0] + parts[1][0]).toUpperCase();
}

export interface AvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: number;
  verified?: boolean;
}

export function Avatar({ name, imageUrl, size = 48, verified }: AvatarProps) {
  const ringColor = colorForSeed(name);

  return (
    <View
      style={[
        styles.wrapper,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: verified ? colors.success : ringColor,
          borderWidth: verified ? 2 : 1.5,
        },
      ]}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: '100%', height: '100%', borderRadius: size / 2 }}
          contentFit="cover"
          transition={150}
        />
      ) : (
        <View style={[styles.fallback, { backgroundColor: ringColor + '33' }]}>
          <Text variant="smallMedium" color="textPrimary" style={{ fontSize: size * 0.34 }}>
            {initialsFor(name)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
