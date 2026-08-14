import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { CommuterCrowdIllustration } from '@/components/onboarding/CommuterCrowdIllustration';
import { OnboardingScaffold } from '@/components/onboarding/OnboardingScaffold';
import { Text } from '@/components/ui/Text';
import { space } from '@/constants/spacing';

export default function Story1() {
  const router = useRouter();

  return (
    <OnboardingScaffold step={1} ctaLabel="Continue" onCta={() => router.push('/(onboarding)/story-2')} showBack={false}>
      <View style={{ alignItems: 'center', gap: space.xl }}>
        <CommuterCrowdIllustration />
        <Text variant="display" style={{ textAlign: 'center' }}>
          Every day, you ride with strangers.
        </Text>
      </View>
    </OnboardingScaffold>
  );
}
