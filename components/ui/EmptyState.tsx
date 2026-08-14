import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { space } from '@/constants/spacing';

export interface EmptyStateProps {
  icon?: keyof typeof Feather.glyphMap;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Product-voice empty states (brief §43) — never "No data found." */
export function EmptyState({ icon = 'compass', title, body, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.iconCircle}>
        <Feather name={icon} size={22} color={colors.textSecondary} />
      </View>
      <Text variant="h3" style={styles.title}>
        {title}
      </Text>
      {body && (
        <Text variant="body" color="textSecondary" style={styles.body}>
          {body}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button label={actionLabel} onPress={onAction} variant="secondary" style={{ marginTop: space.md }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', paddingHorizontal: space.xl, paddingVertical: space.xl },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.md,
  },
  title: { textAlign: 'center', marginBottom: space.xs },
  body: { textAlign: 'center' },
});
