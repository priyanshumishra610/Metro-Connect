import { Icon } from '@/components/ui/Icon';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

import { AuthProviderButton } from '@/components/auth/AuthProviderButton';
import { GoogleFailureCard } from '@/components/auth/GoogleFailureCard';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { TruecallerFallbackSheet } from '@/components/auth/TruecallerFallbackSheet';
import { TruecallerSignInButton } from '@/components/auth/TruecallerSignInButton';
import { Button } from '@/components/ui/Button';
import { InlineError } from '@/components/ui/InlineError';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { colors } from '@/constants/colors';
import { space } from '@/constants/spacing';
import { track } from '@/services/analytics';
import { signInWithGoogleOAuth, signUpWithEmail } from '@/services/auth';
import { useAuthStore } from '@/store/authStore';

export default function Signup() {
  const router = useRouter();
  const enterGuest = useAuthStore((s) => s.enterGuest);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);
  const [googleFailed, setGoogleFailed] = useState(false);
  const [truecallerFallback, setTruecallerFallback] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (!email.includes('@')) return setError('Enter a valid email address.');
    if (password.length < 8) return setError('Password needs to be at least 8 characters.');

    setLoading(true);
    const result = await signUpWithEmail(email.trim(), password);
    setLoading(false);

    if (result.error) return setError(result.error.message);
    if (!result.data) setCheckEmail(true);
  };

  const runGoogle = async () => {
    setGoogleFailed(false);
    const result = await signInWithGoogleOAuth();
    if (result.error?.kind === 'cancelled') return;
    if (result.error) setGoogleFailed(true);
  };

  if (checkEmail) {
    return (
      <ScreenContainer edges={['top', 'bottom']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg }}>
          <Icon name="mail" size={32} color={colors.interactive} />
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
          <Icon name="chevron-left" size={22} color={colors.textPrimary} />
        </Pressable>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingTop: space.xl }} keyboardShouldPersistTaps="handled">
          <Text variant="h1" style={{ marginBottom: space.xs }}>Join your route.</Text>
          <Text variant="body" color="textSecondary" style={{ marginBottom: space.xl }}>
            Takes about a minute, then we will set up your commute.
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
          {googleFailed && <GoogleFailureCard onRetry={runGoogle} onDismiss={() => setGoogleFailed(false)} />}

          <View style={{ height: space.md }} />
          <Button label="Create account" onPress={onSubmit} loading={loading} fullWidth />

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

          <Text variant="caption" color="textSecondary" style={{ marginTop: space.lg, textAlign: 'center' }}>
            By continuing you agree to Metro Connect Terms and Privacy Policy.
          </Text>
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
