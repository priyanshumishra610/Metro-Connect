import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

import { OnboardingScaffold } from '@/components/onboarding/OnboardingScaffold';
import { StationPicker } from '@/components/onboarding/StationPicker';
import { Text } from '@/components/ui/Text';
import { space } from '@/constants/spacing';
import type { StationWithLine } from '@/services/stations';
import { useOnboardingStore } from '@/store/onboardingStore';

export default function DestinationScreen() {
  const router = useRouter();
  const cityId = useOnboardingStore((s) => s.cityId);
  const homeStationId = useOnboardingStore((s) => s.homeStationId);
  const destinationStationId = useOnboardingStore((s) => s.destinationStationId);
  const setDestinationStation = useOnboardingStore((s) => s.setDestinationStation);
  const [pending, setPending] = useState<StationWithLine | null>(null);

  return (
    <OnboardingScaffold
      step={7}
      stretch
      ctaLabel="Continue"
      ctaDisabled={!pending && !destinationStationId}
      onCta={() => router.push('/(onboarding)/schedule')}
    >
      <View style={{ gap: space.md, flex: 1 }}>
        <Text variant="h1">Where are you usually headed?</Text>
        <StationPicker
          cityId={cityId}
          placeholder="Search your destination"
          excludeStationId={homeStationId}
          selectedStationId={pending?.id ?? destinationStationId}
          onSelect={(station) => {
            setPending(station);
            setDestinationStation(station.id, station.name);
          }}
        />
      </View>
    </OnboardingScaffold>
  );
}
