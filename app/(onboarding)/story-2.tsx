import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { CommuterCrowdIllustration } from '@/components/onboarding/CommuterCrowdIllustration';
import { OnboardingScaffold } from '@/components/onboarding/OnboardingScaffold';
import { Text } from '@/components/ui/Text';
import { space } from '@/constants/spacing';

export default function Story2() {
  const router = useRouter();

  return (
    <OnboardingScaffold step={2} ctaLabel="Continue" onCta={() => router.push('/(onboarding)/story-3')}>
      <View style={{ alignItems: 'center', gap: space.xl }}>
        <CommuterCrowdIllustration highlighted={[1, 4, 7]} />
        <Text variant="display" style={{ textAlign: 'center' }}>
          You probably recognize some of them.
        </Text>
      </View>
    </OnboardingScaffold>
  );
}
