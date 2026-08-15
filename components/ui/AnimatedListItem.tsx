import React from 'react';
import Animated, { FadeInUp } from 'react-native-reanimated';

/** Staggered entrance for FlatList/ScrollView rows — caps the delay so a long list doesn't take forever to finish appearing. */
export function AnimatedListItem({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <Animated.View entering={FadeInUp.delay(Math.min(index, 8) * 55).duration(340).springify().damping(18)}>
      {children}
    </Animated.View>
  );
}
