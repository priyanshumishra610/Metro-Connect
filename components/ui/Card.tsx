import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors } from '@/constants/colors';
import { radius, shadow, space } from '@/constants/spacing';

export interface CardProps extends ViewProps {
  /** Elevated = a stronger lift for content that should read as "on top" (the commute card, a modal sheet). */
  elevated?: boolean;
  padded?: boolean;
}

/**
 * A flat, modular paper surface — crisp white against the warm paper
 * background, defined by a precise ink-tinted border rather than a heavy
 * shadow or a blur (the editorial v3 world; see DESIGN.md). The border does
 * most of the definition work here, which is what keeps a page of these
 * from reading as a stack of floating tiles.
 */
export function Card({ elevated, padded = true, style, children, ...rest }: CardProps) {
  return (
    <View style={[styles.base, elevated ? shadow.raised : shadow.card, style]} {...rest}>
      <View style={padded && { padding: space.md }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
});
