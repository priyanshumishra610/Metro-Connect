import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { CommuterCrowdIllustration } from '@/components/onboarding/CommuterCrowdIllustration';
import { OnboardingScaffold } from '@/components/onboarding/OnboardingScaffold';
import { Text } from '@/components/ui/Text';
import { space } from '@/constants/spacing';

export default function Story3() {
  const router = useRouter();

  return (
    <OnboardingScaffold step={3} ctaLabel="Continue" onCta={() => router.push('/(onboarding)/story-4')}>
      <View style={{ alignItems: 'center', gap: space.xl }}>
        <CommuterCrowdIllustration highlighted={[1, 4, 7]} showConnections />
        <Text variant="display" style={{ textAlign: 'center' }}>
          Some of them might actually be worth knowing.
        </Text>
      </View>
    </OnboardingScaffold>
  );
}
