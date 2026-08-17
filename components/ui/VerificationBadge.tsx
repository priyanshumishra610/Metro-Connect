import { Icon, type IconName } from '@/components/ui/Icon';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radius, space } from '@/constants/spacing';

export type VerificationKind = 'profile_complete' | 'commute_verified' | 'identity_verified';

const CONFIG: Record<VerificationKind, { label: string; icon: IconName }> = {
  profile_complete: { label: 'Profile Complete', icon: 'check-circle' },
  commute_verified: { label: 'Commute Verified', icon: 'map-pin' },
  identity_verified: { label: 'Identity Verified', icon: 'shield' },
};

/**
 * Brief §34: never imply a verification status that didn't actually
 * happen. This component only ever renders when the caller has a true
 * boolean/flag to back it — it has no "assume verified" default.
 */
export function VerificationBadge({ kind }: { kind: VerificationKind }) {
  const { label, icon } = CONFIG[kind];
  return (
    <View style={styles.wrapper}>
      <Icon name={icon} size={12} color={colors.success} />
      <Text variant="caption" color="success">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: space.xs,
    paddingVertical: 3,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(47, 107, 79, 0.12)',
    alignSelf: 'flex-start',
  },
});
