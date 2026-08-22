import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AuthProviderButton, GoogleGlyph } from '@/components/auth/AuthProviderButton';
import { GoogleFailureCard } from '@/components/auth/GoogleFailureCard';
import { TruecallerFallbackSheet } from '@/components/auth/TruecallerFallbackSheet';
import { TruecallerSignInButton } from '@/components/auth/TruecallerSignInButton';
import { MetroRouteVisual } from '@/components/metro/MetroRouteVisual';
import { Wordmark } from '@/components/system/Wordmark';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { space } from '@/constants/spacing';
import { track } from '@/services/analytics';
import { signInWithGoogleOAuth } from '@/services/auth';
import { useAuthStore } from '@/store/authStore';

export default function Welcome() {
  const router = useRouter();
  const enterGuest = useAuthStore((s) => s.enterGuest);
  const [googleFailed, setGoogleFailed] = useState(false);
  const [truecallerFallback, setTruecallerFallback] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  const runGoogle = async () => {
    setGoogleFailed(false);
    setGoogleLoading(true);
    const result = await signInWithGoogleOAuth();
    setGoogleLoading(false);
    if (result.error?.kind === 'cancelled') return;
    if (result.error) setGoogleFailed(true);
  };

  const runGuest = async () => {
    setGuestLoading(true);
    track('guest_started');
    await enterGuest();
    setGuestLoading(false);
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <View style={{ flex: 1, justifyContent: 'space-between', paddingVertical: space.md }}>
        <View style={{ alignItems: 'center', paddingTop: space.lg }}>
          <Wordmark />
        </View>

        <View style={{ alignItems: 'center', gap: space.md }}>
          <MetroRouteVisual homeLabel="Your stop" destinationLabel="Someone new" height={80} />
          <Text variant="h1" style={{ textAlign: 'center' }}>
            Ready to stop riding with strangers?
          </Text>
          <Text variant="bodyLarge" color="textSecondary" style={{ textAlign: 'center' }}>
            Pick how you want to get started.
          </Text>
        </View>

        <View style={{ gap: space.sm }}>
          {googleFailed && (
            <GoogleFailureCard onRetry={runGoogle} onDismiss={() => setGoogleFailed(false)} />
          )}

          <AuthProviderButton
            label="Continue with Google"
            glyph={<GoogleGlyph />}
            onPress={runGoogle}
            loading={googleLoading}
          />
          <TruecallerSignInButton
            onError={() => setTruecallerFallback(true)}
            onUnavailable={() => setTruecallerFallback(true)}
          />
            <AuthProviderButton label="Continue with Phone" icon="phone" onPress={() => router.push('/(auth)/phone' as never)} />
          <AuthProviderButton
            label="Continue as Guest"
            icon="user"
            onPress={runGuest}
            loading={guestLoading}
          />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, marginVertical: space.xs }}>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
            <Text variant="caption" color="textSecondary">OR</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          </View>

          <View style={{ flexDirection: 'row', gap: space.sm }}>
            <View style={{ flex: 1 }}>
              <Button label="Sign in" onPress={() => router.push('/(auth)/login')} variant="secondary" fullWidth />
            </View>
            <View style={{ flex: 1 }}>
              <Button label="Create account" onPress={() => router.push('/(auth)/signup')} variant="secondary" fullWidth />
            </View>
          </View>

          <Pressable onPress={runGuest} accessibilityRole="button">
            <Text variant="caption" color="textSecondary" style={{ textAlign: 'center', marginTop: space.xs }}>
              You can explore first. No pressure.
            </Text>
          </Pressable>
        </View>
      </View>

      <TruecallerFallbackSheet
        visible={truecallerFallback}
        onClose={() => setTruecallerFallback(false)}
        onGoogle={runGoogle}
      />
    </ScreenContainer>
  );
}
