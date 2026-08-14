import React, { useEffect } from 'react';
import { AccessibilityInfo, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { colors, type ColorRole } from '@/constants/colors';
import { springs } from '@/constants/motion';
import { radius, space } from '@/constants/spacing';

export interface ComicLabelProps {
  text: string;
  tone?: ColorRole;
  size?: 'small' | 'medium' | 'large';
}

/**
 * The Bangers "WHOOSH!"-style accent (brief §10–11, §49). Reserved for
 * specific special moments — a connection made, a founding-commuter
 * reveal — never used as a default heading. Pops in with a slight
 * overshoot since it always follows a moment that already has momentum
 * (a match, an accept), never a plain screen load.
 */
export function ComicLabel({ text, tone = 'founding', size = 'medium' }: ComicLabelProps) {
  const scale = useSharedValue(0.6);
  const rotate = useSharedValue(-4);

  useEffect(() => {
    let reduceMotion = false;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      reduceMotion = enabled;
      scale.value = withDelay(reduceMotion ? 0 : 40, withSpring(1, reduceMotion ? springs.settle : springs.momentum));
      rotate.value = withSpring(-2, springs.settle);
    });
  }, [rotate, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
  }));

  const variant = size === 'large' ? 'comicLarge' : size === 'small' ? 'comicSmall' : 'comicMedium';

  return (
    <Animated.View
      accessibilityRole="text"
      style={[styles.wrapper, { backgroundColor: colors[tone] }, animatedStyle]}
    >
      <Text variant={variant} color="textInverse">
        {text}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'flex-start',
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    borderRadius: radius.md,
  },
});
