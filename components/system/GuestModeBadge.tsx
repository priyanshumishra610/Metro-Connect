import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { space } from '@/constants/spacing';
import { useAuthStore } from '@/store/authStore';

/** Persistent guest label. Quiet chrome, not a comic burst. */
export function GuestModeBadge() {
  const isGuest = useAuthStore((s) => s.isGuest);
  const insets = useSafeAreaInsets();

  if (!isGuest) return null;

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top + space.xs }]} pointerEvents="none">
      <View style={styles.pill}>
        <Text variant="label" color="textOnAccent">
          GUEST MODE
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    alignItems: 'center',
  },
  pill: {
    backgroundColor: colors.textPrimary,
    paddingHorizontal: space.sm,
    paddingVertical: 5,
    borderRadius: 999,
  },
});
