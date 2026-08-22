import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

import { AuthProviderButton } from '@/components/auth/AuthProviderButton';
import { GoogleFailureCard } from '@/components/auth/GoogleFailureCard';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { TruecallerFallbackSheet } from '@/components/auth/TruecallerFallbackSheet';
import { TruecallerSignInButton } from '@/components/auth/TruecallerSignInButton';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { InlineError } from '@/components/ui/InlineError';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { colors } from '@/constants/colors';
import { space } from '@/constants/spacing';
import { track } from '@/services/analytics';
import { signInWithEmail, signInWithGoogleOAuth } from '@/services/auth';
import { useAuthStore } from '@/store/authStore';

export default function Login() {
  const router = useRouter();
  const enterGuest = useAuthStore((s) => s.enterGuest);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleFailed, setGoogleFailed] = useState(false);
  const [truecallerFallback, setTruecallerFallback] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (!email.includes('@')) return setError('Enter a valid email address.');
    if (password.length < 6) return setError('Password needs to be at least 6 characters.');

    setLoading(true);
    const result = await signInWithEmail(email.trim(), password);
    setLoading(false);
    if (result.error) setError(result.error.message);
  };

  const runGoogle = async () => {
    setGoogleFailed(false);
    const result = await signInWithGoogleOAuth();
    if (result.error?.kind === 'cancelled') return;
    if (result.error) setGoogleFailed(true);
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <View style={{ paddingTop: space.sm }}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel="Back">
          <Icon name="chevron-left" size={22} color={colors.textPrimary} />
        </Pressable>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingTop: space.xl }} keyboardShouldPersistTaps="handled">
          <Text variant="h1" style={{ marginBottom: space.xs }}>Welcome back.</Text>
          <Text variant="body" color="textSecondary" style={{ marginBottom: space.xl }}>
            Sign in to see who is on your route today.
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
            autoComplete="password"
            textContentType="password"
          />

          <Pressable onPress={() => router.push('/(auth)/forgot-password')} style={{ marginBottom: space.lg }}>
            <Text variant="smallMedium" color="interactive">Forgot password?</Text>
          </Pressable>

          {error && <InlineError message={error} />}
          {googleFailed && (
            <GoogleFailureCard onRetry={runGoogle} onDismiss={() => setGoogleFailed(false)} />
          )}

          <View style={{ height: space.md }} />
          <Button label="Sign in" onPress={onSubmit} loading={loading} fullWidth />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, marginVertical: space.lg }}>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
            <Text variant="caption" color="textSecondary">OR</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          </View>

          <View style={{ gap: space.sm }}>
            <TruecallerSignInButton onError={() => setTruecallerFallback(true)} onUnavailable={() => setTruecallerFallback(true)} />
            <GoogleSignInButton onError={() => setGoogleFailed(true)} />
            <AuthProviderButton label="Continue with Phone" icon="phone" onPress={() => router.push('/(auth)/phone' as never)} />
            <AuthProviderButton
              label="Continue as Guest"
              icon="user"
              onPress={async () => {
                track('guest_started');
                await enterGuest();
              }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <TruecallerFallbackSheet
        visible={truecallerFallback}
        onClose={() => setTruecallerFallback(false)}
        onGoogle={runGoogle}
      />
    </ScreenContainer>
  );
}
