import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors } from '@/constants/colors';
import { radius, shadow, space } from '@/constants/spacing';

export interface CardProps extends ViewProps {
  elevated?: boolean;
  padded?: boolean;
}

export function Card({ elevated, padded = true, style, children, ...rest }: CardProps) {
  return (
    <View
      style={[
        styles.base,
        elevated && shadow.card,
        { backgroundColor: elevated ? colors.cardElevated : colors.card },
        padded && { padding: space.md },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
