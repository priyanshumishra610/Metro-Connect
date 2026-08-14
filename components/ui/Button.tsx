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
        scale.value = withSpring(0.97, springs.press);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, springs.press);
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
        <ActivityIndicator color={variant === 'primary' ? colors.textOnAccent : colors.interactive} />
      ) : (
        <Text variant="bodySemiBold" color={variant === 'secondary' || variant === 'ghost' ? 'textPrimary' : 'textOnAccent'}>
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
  disabled: { opacity: 0.45 },
});

const variantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: { backgroundColor: colors.interactive },
  secondary: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderStrong },
  ghost: { backgroundColor: 'transparent' },
  destructive: { backgroundColor: colors.danger },
};
