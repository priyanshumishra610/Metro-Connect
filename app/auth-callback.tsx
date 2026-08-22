import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import * as Linking from 'expo-linking';

import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { AUTH_COPY } from '@/lib/authErrors';
import { space } from '@/constants/spacing';
import { establishSessionFromUrl } from '@/services/auth';
import { useAuthStore } from '@/store/authStore';

/**
 * OAuth return route. Never leaves a blank page: success hydrates the
 * session, cancel/expired/invalid/network get a recovery screen.
 */
export default function AuthCallback() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const url = await Linking.getInitialURL();
      const href =
        url ??
        (typeof params.code === 'string'
          ? `metroconnect://auth-callback?code=${encodeURIComponent(params.code)}`
          : null);

      if (!href) {
        if (!cancelled) {
          setBusy(false);
          setError(AUTH_COPY.googleFailed);
        }
        return;
      }

      const result = await establishSessionFromUrl(href);
      if (cancelled) return;
      if (result.error?.kind === 'cancelled') {
        setBusy(false);
        setError(null);
        return;
      }
      if (result.error) {
        setBusy(false);
        setError(result.error.message);
        return;
      }
      setBusy(false);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [params.code]);

  if (status === 'AUTHENTICATED' || status === 'GUEST') {
    return <Redirect href="/" />;
  }

  if (busy) {
    return (
      <ScreenContainer edges={['top', 'bottom']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: space.md }}>
          <ActivityIndicator color={colors.interactive} />
          <Text variant="body" color="textSecondary">
            Finishing sign-in.
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <View style={{ flex: 1, justifyContent: 'center', gap: space.md }}>
        <Text variant="h2">{error ?? 'Sign-in was cancelled.'}</Text>
        <Text variant="body" color="textSecondary">
          You can try again or pick another way in.
        </Text>
        <Button label="Back to sign in" onPress={() => router.replace('/(auth)/welcome')} fullWidth />
        <Button label="Continue as Guest" variant="secondary" onPress={() => useAuthStore.getState().enterGuest()} fullWidth />
      </View>
    </ScreenContainer>
  );
}
