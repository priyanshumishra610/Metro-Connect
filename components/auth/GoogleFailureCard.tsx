import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { AUTH_COPY } from '@/lib/authErrors';
import { radius, space } from '@/constants/spacing';

export function GoogleFailureCard({
  onRetry,
  onDismiss,
}: {
  onRetry: () => void;
  onDismiss: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Icon name="alert-triangle" size={18} color={colors.warning} />
        <Text variant="bodyMedium" style={{ flex: 1 }}>
          {AUTH_COPY.googleFailed}
        </Text>
      </View>
      <View style={styles.actions}>
        <Button label="Try again" onPress={onRetry} />
        <Button label="Use another method" variant="ghost" onPress={onDismiss} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: space.sm,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  actions: { gap: space.xs },
});
