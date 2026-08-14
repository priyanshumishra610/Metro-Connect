import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

import { OnboardingScaffold } from '@/components/onboarding/OnboardingScaffold';
import { StationPicker } from '@/components/onboarding/StationPicker';
import { Text } from '@/components/ui/Text';
import { space } from '@/constants/spacing';
import { useOnboardingStore } from '@/store/onboardingStore';
import type { Station } from '@/types/database';

export default function StationScreen() {
  const router = useRouter();
  const setHomeStation = useOnboardingStore((s) => s.setHomeStation);
  const homeStationId = useOnboardingStore((s) => s.homeStationId);
  const [pending, setPending] = useState<Station | null>(null);

  return (
    <OnboardingScaffold
      step={5}
      stretch
      ctaLabel="Continue"
      ctaDisabled={!pending && !homeStationId}
      onCta={() => router.push('/(onboarding)/destination')}
    >
      <View style={{ gap: space.md, flex: 1 }}>
        <Text variant="h1">Where does your journey begin?</Text>
        <StationPicker
          placeholder="Search your home station"
          selectedStationId={pending?.id ?? homeStationId}
          onSelect={(station) => {
            setPending(station);
            setHomeStation(station.id, station.name);
          }}
        />
      </View>
    </OnboardingScaffold>
  );
}
