import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native';

import { Wordmark } from '@/components/system/Wordmark';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { space } from '@/constants/spacing';
import { useAuth } from '@/hooks/useAuth';
import { recordReferralEvent } from '@/services/referrals';

export default function InviteLanding() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (code) recordReferralEvent(code, 'opened');
  }, [code]);

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: space.lg, paddingHorizontal: space.lg }}>
        <Wordmark />
        <Text variant="h2" style={{ textAlign: 'center' }}>
          You've been invited to a route.
        </Text>
        <Text variant="body" color="textSecondary" style={{ textAlign: 'center' }}>
          Someone who takes the same metro as you is already on Metro Connect. Set up your commute
          and see who else is on it.
        </Text>
        <Button
          label={isSignedIn ? 'Open Metro Connect' : 'Get started'}
          onPress={() => router.replace(isSignedIn ? '/(tabs)' : '/(auth)/signup')}
          fullWidth
        />
      </View>
    </ScreenContainer>
  );
}
