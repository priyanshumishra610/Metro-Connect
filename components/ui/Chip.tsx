import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { colors, type ColorRole } from '@/constants/colors';
import { springs } from '@/constants/motion';
import { radius, space } from '@/constants/spacing';

export interface ChipProps {
  label: string;
  icon?: keyof typeof Feather.glyphMap;
  tone?: ColorRole;
  selected?: boolean;
  onPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Used for interests, route legs, and relevance reasons — one consistent pill across the app. Unselected chips are outlined paper; selected chips fill solid with the tone color. */
export function Chip({ label, icon, tone = 'interactive', selected, onPress }: ChipProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const content = (
    <>
      {icon && <Feather name={icon} size={13} color={selected ? colors.textOnAccent : colors[tone]} style={styles.icon} />}
      <Text variant="smallMedium" color={selected ? 'textOnAccent' : 'textPrimary'}>
        {label}
      </Text>
    </>
  );

  const chipStyle = {
    backgroundColor: selected ? colors[tone] : colors.card,
    borderColor: selected ? colors[tone] : colors.border,
  };

  if (!onPress) {
    return <View style={[styles.chip, chipStyle]}>{content}</View>;
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.94, springs.press);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, springs.momentum);
      }}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      style={[styles.chip, chipStyle, animatedStyle]}
    >
      {content}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.sm,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  icon: { marginRight: 6 },
});
