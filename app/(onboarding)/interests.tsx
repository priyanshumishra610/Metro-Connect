import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';

import { OnboardingScaffold } from '@/components/onboarding/OnboardingScaffold';
import { Chip } from '@/components/ui/Chip';
import { Text } from '@/components/ui/Text';
import { interestCatalog } from '@/constants/interests';
import { space } from '@/constants/spacing';
import { useOnboardingStore } from '@/store/onboardingStore';

export default function InterestsScreen() {
  const router = useRouter();
  const interestIds = useOnboardingStore((s) => s.interestIds);
  const toggleInterest = useOnboardingStore((s) => s.toggleInterest);

  const goNext = () => router.push('/(onboarding)/ready');

  return (
    <OnboardingScaffold
      step={10}
      stretch
      ctaLabel={interestIds.length > 0 ? `Continue · ${interestIds.length} selected` : 'Continue'}
      onCta={goNext}
      onSkip={goNext}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text variant="h1" style={{ marginBottom: space.xs }}>What are you into?</Text>
        <Text variant="body" color="textSecondary" style={{ marginBottom: space.lg }}>
          Helps us surface people worth talking to — totally optional.
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {interestCatalog.map((interest) => (
            <Chip
              key={interest.slug}
              label={interest.label}
              icon={interest.icon}
              tone="interestMatch"
              selected={interestIds.includes(interest.slug)}
              onPress={() => toggleInterest(interest.slug)}
            />
          ))}
        </View>
      </ScrollView>
    </OnboardingScaffold>
  );
}
