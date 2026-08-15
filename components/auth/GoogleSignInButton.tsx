import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { springs } from '@/constants/motion';
import { minTouchTarget, radius, space } from '@/constants/spacing';
import { signInWithGoogleOAuth } from '@/services/auth';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface GoogleSignInButtonProps {
  onError: (message: string) => void;
  disabled?: boolean;
}

/**
 * A plain single-color "G" monogram, not Google's official multicolor mark
 * — the text label carries the recognition, so this stays clear of Google's
 * brand-asset guidelines while still reading unambiguously as "sign in with
 * Google."
 */
function GoogleGlyph() {
  return (
    <View style={styles.glyph}>
      <Text variant="bodySemiBold" color="textPrimary" style={{ fontSize: 13 }}>G</Text>
    </View>
  );
}

export function GoogleSignInButton({ onError, disabled }: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const isDisabled = disabled || loading;

  const onPress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);
    const result = await signInWithGoogleOAuth();
    setLoading(false);
    // On success, onAuthStateChange (store/authStore.ts) flips the session and app/index.tsx redirects — nothing to do here.
    if (result.error) onError(result.error.message);
  };

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel="Continue with Google"
      disabled={isDisabled}
      onPressIn={() => {
        scale.value = withSpring(0.96, springs.press);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, springs.momentum);
      }}
      onPress={onPress}
      style={[styles.base, isDisabled && styles.disabled, animatedStyle]}
    >
      {loading ? (
        <ActivityIndicator color={colors.textPrimary} />
      ) : (
        <>
          <GoogleGlyph />
          <Text variant="cta" color="textPrimary">Continue with Google</Text>
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
    borderWidth: 1.5,
    borderColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: space.xs,
    alignSelf: 'stretch',
  },
  disabled: { opacity: 0.4 },
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
