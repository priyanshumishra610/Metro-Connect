import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { InlineError } from '@/components/ui/InlineError';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { colors } from '@/constants/colors';
import { space } from '@/constants/spacing';
import { track } from '@/services/analytics';
import { signUpWithEmail } from '@/services/auth';

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (!email.includes('@')) return setError('Enter a valid email address.');
    if (password.length < 8) return setError('Password needs to be at least 8 characters.');

    track('signup_started');
    setLoading(true);
    const result = await signUpWithEmail(email.trim(), password);
    setLoading(false);

    if (result.error) return setError(result.error.message);

    track('signup_completed');
    if (result.data) {
      // Session came back immediately (email confirmation off) — app/index.tsx will route to onboarding.
    } else {
      setCheckEmail(true);
    }
  };

  if (checkEmail) {
    return (
      <ScreenContainer edges={['top', 'bottom']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg }}>
          <Feather name="mail" size={32} color={colors.interactive} />
          <Text variant="h2" style={{ textAlign: 'center' }}>Check your inbox</Text>
          <Text variant="body" color="textSecondary" style={{ textAlign: 'center' }}>
            We sent a confirmation link to {email}. Verify your email, then come back and sign in.
          </Text>
          <Button label="Back to sign in" onPress={() => router.replace('/(auth)/login')} variant="secondary" />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <View style={{ paddingTop: space.sm }}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel="Back">
          <Feather name="chevron-left" size={22} color={colors.textPrimary} />
        </Pressable>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingTop: space.xl }} keyboardShouldPersistTaps="handled">
          <Text variant="h1" style={{ marginBottom: space.xs }}>Join your route.</Text>
          <Text variant="body" color="textSecondary" style={{ marginBottom: space.xl }}>
            Takes about a minute — then we'll set up your commute.
          </Text>

          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
          />
          <TextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password-new"
            textContentType="newPassword"
          />

          {error && <InlineError message={error} />}

          <View style={{ height: space.md }} />
          <Button label="Create account" onPress={onSubmit} loading={loading} fullWidth />

          <Text variant="caption" color="textSecondary" style={{ marginTop: space.lg, textAlign: 'center' }}>
            By continuing you agree to Metro Connect's Terms and Privacy Policy.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
