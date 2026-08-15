import React, { useEffect } from 'react';
import { AccessibilityInfo, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedProps, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import Svg, { Circle, Defs, Line, LinearGradient, Stop } from 'react-native-svg';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { space } from '@/constants/spacing';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface MetroRouteVisualProps {
  homeLabel: string;
  destinationLabel: string;
  lineColor?: string;
  height?: number;
}

/**
 * Metro Connect's signature visual component (brief §47) — an original,
 * generic route diagram (never a real transit authority's copyrighted map
 * or wordmark). A small train travels the line continuously; each station
 * has a soft pulse to read as "alive" without being distracting.
 */
export function MetroRouteVisual({ homeLabel, destinationLabel, lineColor = colors.interactive, height = 96 }: MetroRouteVisualProps) {
  const { width: screenWidth } = useWindowDimensions();
  const width = Math.min(screenWidth - space.md * 2, 520);
  const trackY = height * 0.42;
  const inset = 28;

  const progress = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (reduced) {
        progress.value = 0.5;
        return;
      }
      progress.value = withRepeat(withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.ease) }), -1, true);
      pulse.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.out(Easing.ease) }), -1, false);
    });
  }, [progress, pulse]);

  const trainProps = useAnimatedProps(() => ({
    cx: inset + progress.value * (width - inset * 2),
  }));

  const pulseProps = useAnimatedProps(() => ({
    r: 5 + pulse.value * 6,
    opacity: 1 - pulse.value,
  }));

  return (
    <View style={{ width }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="track" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={lineColor} stopOpacity={0.35} />
            <Stop offset="0.5" stopColor={lineColor} stopOpacity={1} />
            <Stop offset="1" stopColor={lineColor} stopOpacity={0.35} />
          </LinearGradient>
        </Defs>

        <Line x1={inset} y1={trackY} x2={width - inset} y2={trackY} stroke="url(#track)" strokeWidth={3} strokeLinecap="round" />

        <Circle cx={inset} cy={trackY} r={7} fill={colors.bg} stroke={lineColor} strokeWidth={3} />
        <AnimatedCircle cx={inset} cy={trackY} fill="none" stroke={lineColor} strokeWidth={2} animatedProps={pulseProps} />

        <Circle cx={width - inset} cy={trackY} r={7} fill={colors.bg} stroke={colors.interestMatch} strokeWidth={3} />

        <AnimatedCircle cy={trackY} r={5} fill={colors.interactive} animatedProps={trainProps} />
      </Svg>

      <View style={[styles.labelRow, { top: trackY + 16 }]}>
        <Text variant="smallMedium" color="textPrimary" numberOfLines={1} style={{ maxWidth: width / 2 - space.md }}>
          {homeLabel}
        </Text>
        <Text variant="smallMedium" color="textPrimary" numberOfLines={1} style={{ maxWidth: width / 2 - space.md }}>
          {destinationLabel}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labelRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
