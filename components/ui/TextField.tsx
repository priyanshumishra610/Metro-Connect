import React, { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { fontFamily } from '@/constants/typography';
import { radius, space } from '@/constants/spacing';

export interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function TextField({ label, error, style, onFocus, onBlur, ...rest }: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? colors.danger : focused ? colors.interactive : colors.border;

  return (
    <View style={styles.group}>
      {label && (
        <Text variant="label" color="textSecondary" style={styles.label}>
          {label}
        </Text>
      )}
      <TextInput
        style={[styles.input, { borderColor, borderWidth: focused || error ? 1.5 : 1 }, style]}
        placeholderTextColor={colors.textSecondary}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        accessibilityLabel={label}
        {...rest}
      />
      {error && (
        <Text variant="small" color="danger" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { marginBottom: space.md },
  label: { marginBottom: space.xs },
  input: {
    minHeight: 48,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    color: colors.textPrimary,
    fontFamily: fontFamily.bodyRegular,
    fontSize: 15,
    backgroundColor: colors.card,
  },
  error: { marginTop: space.xs },
});
