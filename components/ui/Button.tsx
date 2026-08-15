import * as Haptics from 'expo-haptics';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { springs } from '@/constants/motion';
import { minTouchTarget, radius, space } from '@/constants/spacing';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  accessibilityHint?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const TEXT_COLOR: Record<ButtonVariant, 'textOnAccent' | 'textPrimary'> = {
  primary: 'textOnAccent',
  destructive: 'textOnAccent',
  secondary: 'textPrimary',
  ghost: 'textPrimary',
};

/**
 * Primary/destructive are solid, direct, all-caps bold — the "speaking
 * plainly" CTA convention this world is built on (brief context: v3
 * redesign). Secondary/ghost stay ink-outlined or bare rather than filled,
 * so the one accent color (never used for button fills) keeps its meaning
 * elsewhere — links, tags, the metro visual.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  fullWidth,
  style,
  accessibilityHint,
}: ButtonProps) {
  const scale = useSharedValue(1);
  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityHint={accessibilityHint}
      disabled={isDisabled}
      hitSlop={8}
      onPressIn={() => {
        scale.value = withSpring(0.96, springs.press);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, springs.momentum);
      }}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={[
        styles.base,
        variantStyles[variant],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        animatedStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={TEXT_COLOR[variant] === 'textOnAccent' ? colors.textOnAccent : colors.textPrimary} />
      ) : (
        <Text variant="cta" color={TEXT_COLOR[variant]}>
          {label}
        </Text>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: minTouchTarget,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: { alignSelf: 'stretch' },
  disabled: { opacity: 0.4 },
});

const variantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: { backgroundColor: colors.textPrimary },
  secondary: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.textPrimary },
  ghost: { backgroundColor: 'transparent' },
  destructive: { backgroundColor: colors.danger },
};
