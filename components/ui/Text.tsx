import React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { colors, type ColorRole } from '@/constants/colors';
import { type, type TypeToken } from '@/constants/typography';

export interface TextProps extends RNTextProps {
  variant?: TypeToken;
  color?: ColorRole;
}

/** The one Text component screens should use — keeps every string on the type scale instead of ad hoc fontSize props. */
export function Text({ variant = 'body', color = 'textPrimary', style, ...rest }: TextProps) {
  const token = type[variant];
  return (
    <RNText
      style={[
        {
          fontFamily: token.fontFamily,
          fontSize: token.fontSize,
          lineHeight: token.lineHeight,
          letterSpacing: token.letterSpacing,
          textTransform: token.textTransform ?? 'none',
          color: colors[color],
        },
        style,
      ]}
      {...rest}
    />
  );
}
