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
import { signInWithEmail } from '@/services/auth';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    if (!email.includes('@')) return setError('Enter a valid email address.');
    if (password.length < 6) return setError('Password needs to be at least 6 characters.');

    setLoading(true);
    const result = await signInWithEmail(email.trim(), password);
    setLoading(false);
    if (result.error) setError(result.error.message);
    // Successful sign-in flips the auth store via onAuthStateChange, and app/index.tsx redirects.
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <View style={{ paddingTop: space.sm }}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel="Back">
          <Feather name="chevron-left" size={22} color={colors.textPrimary} />
        </Pressable>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingTop: space.xl }} keyboardShouldPersistTaps="handled">
          <Text variant="h1" style={{ marginBottom: space.xs }}>Welcome back.</Text>
          <Text variant="body" color="textSecondary" style={{ marginBottom: space.xl }}>
            Sign in to see who's on your route today.
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

          <View style={{ height: space.md }} />
          <Button label="Sign in" onPress={onSubmit} loading={loading} fullWidth />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
