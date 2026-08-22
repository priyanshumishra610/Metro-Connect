import * as Haptics from 'expo-haptics';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Icon, type IconName } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { springs } from '@/constants/motion';
import { minTouchTarget, radius, space } from '@/constants/spacing';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type AuthProviderTone = 'solid' | 'outline' | 'accent';

export interface AuthProviderButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  tone?: AuthProviderTone;
  icon?: IconName;
  glyph?: React.ReactNode;
  accessibilityLabel?: string;
}

export function AuthProviderButton({
  label,
  onPress,
  loading,
  disabled,
  tone = 'outline',
  icon,
  glyph,
  accessibilityLabel,
}: AuthProviderButtonProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const isDisabled = disabled || loading;
  const onAccent = tone === 'solid' || tone === 'accent';

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={isDisabled}
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
      style={[styles.base, toneStyles[tone], isDisabled && styles.disabled, animatedStyle]}
    >
      {loading ? (
        <ActivityIndicator color={onAccent ? colors.textOnAccent : colors.textPrimary} />
      ) : (
        <>
          {glyph}
          {icon && !glyph ? (
            <Icon name={icon} size={18} color={onAccent ? colors.textOnAccent : colors.textPrimary} />
          ) : null}
          <Text variant="cta" color={onAccent ? 'textOnAccent' : 'textPrimary'}>
            {label}
          </Text>
        </>
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
    gap: space.xs,
    alignSelf: 'stretch',
  },
  disabled: { opacity: 0.4 },
});

const toneStyles: Record<AuthProviderTone, ViewStyle> = {
  solid: { backgroundColor: colors.textPrimary },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.textPrimary },
  accent: { backgroundColor: colors.info },
};

export function GoogleGlyph() {
  return (
    <View style={glyphStyles.glyph}>
      <Text variant="bodySemiBold" color="textPrimary" style={{ fontSize: 13 }}>
        G
      </Text>
    </View>
  );
}

const glyphStyles = StyleSheet.create({
  glyph: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
