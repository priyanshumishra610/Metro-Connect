import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { space } from '@/constants/spacing';
import { useAuthStore } from '@/store/authStore';

/**
 * Honest labeling required by brief §82: never let the app imply a live
 * backend is connected when it isn't. Shows only in demo mode (no Supabase
 * credentials), and is dismissible so it doesn't get in the way once seen.
 */
export function DemoModeBanner() {
  const isDemoMode = useAuthStore((s) => s.isDemoMode);
  const insets = useSafeAreaInsets();
  const [dismissed, setDismissed] = useState(false);

  if (!isDemoMode || dismissed) return null;

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top + space.xs }]} pointerEvents="box-none">
      <View style={styles.pill}>
        <Feather name="database" size={12} color={colors.warning} />
        <Text variant="caption" color="textSecondary" style={{ flex: 1 }}>
          Demo mode — Supabase isn't configured, so you're seeing seed data.
        </Text>
        <Pressable onPress={() => setDismissed(true)} hitSlop={8} accessibilityLabel="Dismiss">
          <Feather name="x" size={14} color={colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50, paddingHorizontal: space.md },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: space.sm,
    paddingVertical: 6,
  },
});
