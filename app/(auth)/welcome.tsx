import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { MetroRouteVisual } from '@/components/metro/MetroRouteVisual';
import { Wordmark } from '@/components/system/Wordmark';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { space } from '@/constants/spacing';

export default function Welcome() {
  const router = useRouter();

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
          <Button label="Create account" onPress={() => router.push('/(auth)/signup')} fullWidth />
          <Button label="I already have an account" onPress={() => router.push('/(auth)/login')} variant="secondary" fullWidth />
        </View>
      </View>
    </ScreenContainer>
  );
}
