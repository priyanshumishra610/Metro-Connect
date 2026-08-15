import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

import { MetroRouteVisual } from '@/components/metro/MetroRouteVisual';
import { Wordmark } from '@/components/system/Wordmark';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { TruecallerSignInButton } from '@/components/auth/TruecallerSignInButton';
import { Button } from '@/components/ui/Button';
import { InlineError } from '@/components/ui/InlineError';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { space } from '@/constants/spacing';

export default function Welcome() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <View style={{ flex: 1, justifyContent: 'space-between', paddingVertical: space.xl }}>
        <View />

        <View style={{ alignItems: 'center', gap: space.lg }}>
          <Wordmark />
          <MetroRouteVisual homeLabel="Your stop" destinationLabel="Someone new" height={80} />
          <Text variant="h2" style={{ textAlign: 'center' }}>
            Meet the people already riding with you.
          </Text>
          <Text variant="bodyLarge" color="textSecondary" style={{ textAlign: 'center' }}>
            Same route. Different story.
          </Text>
        </View>

        <View style={{ gap: space.sm }}>
          {error && <InlineError message={error} />}

          <TruecallerSignInButton onError={setError} />
          <GoogleSignInButton onError={setError} />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, marginVertical: space.xs }}>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
            <Text variant="caption" color="textSecondary">OR</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          </View>

          <Button label="Create account" onPress={() => router.push('/(auth)/signup')} fullWidth />
          <Button label="I already have an account" onPress={() => router.push('/(auth)/login')} variant="secondary" fullWidth />
        </View>
      </View>
    </ScreenContainer>
  );
}
