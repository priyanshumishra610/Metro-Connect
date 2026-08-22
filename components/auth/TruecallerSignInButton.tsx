import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthProviderButton } from '@/components/auth/AuthProviderButton';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { isTruecallerOffered, signInWithTruecaller } from '@/services/truecallerAuth';

export interface TruecallerSignInButtonProps {
  onError: (message: string) => void;
  onUnavailable: () => void;
}

export function TruecallerSignInButton({ onError, onUnavailable }: TruecallerSignInButtonProps) {
  const [loading, setLoading] = useState(false);

  if (!isTruecallerOffered()) return null;

  const onPress = async () => {
    setLoading(true);
    const result = await signInWithTruecaller();
    setLoading(false);
    if (result.error?.kind === 'cancelled') return;
    if (result.data && 'unavailable' in result.data) {
      onUnavailable();
      return;
    }
    if (result.error) onError(result.error.message);
  };

  return (
    <AuthProviderButton
      label="Continue with Truecaller"
      glyph={
        <View style={styles.glyph}>
          <Text variant="bodySemiBold" color="textOnAccent" style={{ fontSize: 12 }}>
            TC
          </Text>
        </View>
      }
      onPress={onPress}
      loading={loading}
      tone="accent"
    />
  );
}

const styles = StyleSheet.create({
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
