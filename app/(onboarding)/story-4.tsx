import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { OnboardingScaffold } from '@/components/onboarding/OnboardingScaffold';
import { ComicLabel } from '@/components/ui/ComicLabel';
import { Text } from '@/components/ui/Text';
import { comic } from '@/constants/copy';
import { space } from '@/constants/spacing';

export default function Story4() {
  const router = useRouter();

  return (
    <OnboardingScaffold step={4} ctaLabel="Get Started" onCta={() => router.push('/(onboarding)/station')}>
      <View style={{ alignItems: 'center', gap: space.lg }}>
        <ComicLabel text={comic.nextStop} tone="founding" size="small" />
        <Text variant="display" style={{ textAlign: 'center' }}>
          Let's fix that.
        </Text>
        <Text variant="bodyLarge" color="textSecondary" style={{ textAlign: 'center' }}>
          Set your route and we'll show you who's already on it.
        </Text>
      </View>
    </OnboardingScaffold>
  );
}
