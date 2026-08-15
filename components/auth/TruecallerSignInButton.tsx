import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { springs } from '@/constants/motion';
import { minTouchTarget, radius, space } from '@/constants/spacing';
import { isTruecallerAvailable, signInWithTruecaller } from '@/services/truecallerAuth';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface TruecallerSignInButtonProps {
  onError: (message: string) => void;
}

/** Android-only (Truecaller's iOS SDK is far more limited) — renders nothing on iOS or when the native module/credentials aren't present, so callers can drop it in unconditionally. */
export function TruecallerSignInButton({ onError }: TruecallerSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  if (!isTruecallerAvailable()) return null;

  const onPress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);
    const result = await signInWithTruecaller();
    setLoading(false);
    if (result.error) onError(result.error.message);
  };

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel="Continue with Truecaller"
      disabled={loading}
      onPressIn={() => {
        scale.value = withSpring(0.96, springs.press);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, springs.momentum);
      }}
      onPress={onPress}
      style={[styles.base, loading && styles.disabled, animatedStyle]}
    >
      {loading ? (
        <ActivityIndicator color={colors.textOnAccent} />
      ) : (
        <>
          <View style={styles.glyph}>
            <Text variant="bodySemiBold" color="textOnAccent" style={{ fontSize: 12 }}>TC</Text>
          </View>
          <Text variant="cta" color="textOnAccent">Continue with Truecaller</Text>
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
    backgroundColor: colors.info,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: space.xs,
    alignSelf: 'stretch',
  },
  disabled: { opacity: 0.5 },
  glyph: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.textOnAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
