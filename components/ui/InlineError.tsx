import { Icon } from '@/components/ui/Icon';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radius, space } from '@/constants/spacing';

/** Shared surface for the loading/empty/offline/error states brief §61 asks every network operation to have. */
export function InlineError({ message }: { message: string }) {
  return (
    <View style={styles.wrapper}>
      <Icon name="alert-triangle" size={16} color={colors.warning} />
      <Text variant="body" color="textSecondary" style={{ flex: 1 }}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
