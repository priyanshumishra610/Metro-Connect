import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, type ColorRole } from '@/constants/colors';
import { radius, space } from '@/constants/spacing';

export interface ChipProps {
  label: string;
  icon?: keyof typeof Feather.glyphMap;
  tone?: ColorRole;
  selected?: boolean;
  onPress?: () => void;
}

/** Used for interests, route legs, and relevance reasons — one consistent pill across the app. */
export function Chip({ label, icon, tone = 'interactive', selected, onPress }: ChipProps) {
  const Wrapper = onPress ? Pressable : View;
  return (
    <Wrapper
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={onPress ? { selected: !!selected } : undefined}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors[tone] : colors.card,
          borderColor: selected ? colors[tone] : colors.border,
        },
      ]}
    >
      {icon && <Feather name={icon} size={13} color={selected ? colors.textOnAccent : colors[tone]} />}
      <Text variant="smallMedium" color={selected ? 'textOnAccent' : 'textSecondary'}>
        {label}
      </Text>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: space.sm,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
});
