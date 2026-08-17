import { Icon } from '@/components/ui/Icon';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { InlineError } from '@/components/ui/InlineError';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { colors } from '@/constants/colors';
import { space } from '@/constants/spacing';
import { sendPasswordReset } from '@/services/auth';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (!email.includes('@')) return setError('Enter a valid email address.');
    setLoading(true);
    const result = await sendPasswordReset(email.trim());
    setLoading(false);
    if (result.error) return setError(result.error.message);
    setSent(true);
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <View style={{ paddingTop: space.sm }}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel="Back">
          <Icon name="chevron-left" size={22} color={colors.textPrimary} />
        </Pressable>
      </View>

      <View style={{ flex: 1, paddingTop: space.xl }}>
        {sent ? (
          <View style={{ alignItems: 'center', gap: space.md, paddingTop: space.xxl }}>
            <Icon name="mail" size={32} color={colors.interactive} />
            <Text variant="h2" style={{ textAlign: 'center' }}>Check your inbox</Text>
            <Text variant="body" color="textSecondary" style={{ textAlign: 'center' }}>
              If an account exists for {email}, we've sent a link to reset your password.
            </Text>
          </View>
        ) : (
          <>
            <Text variant="h1" style={{ marginBottom: space.xs }}>Reset your password.</Text>
            <Text variant="body" color="textSecondary" style={{ marginBottom: space.xl }}>
              We'll email you a link to get back in.
            </Text>

            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />

            {error && <InlineError message={error} />}

            <View style={{ height: space.md }} />
            <Button label="Send reset link" onPress={onSubmit} loading={loading} fullWidth />
          </>
        )}
      </View>
    </ScreenContainer>
  );
}
