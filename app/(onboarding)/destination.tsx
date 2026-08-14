import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

import { OnboardingScaffold } from '@/components/onboarding/OnboardingScaffold';
import { StationPicker } from '@/components/onboarding/StationPicker';
import { Text } from '@/components/ui/Text';
import { space } from '@/constants/spacing';
import { useOnboardingStore } from '@/store/onboardingStore';
import type { Station } from '@/types/database';

export default function DestinationScreen() {
  const router = useRouter();
  const homeStationId = useOnboardingStore((s) => s.homeStationId);
  const destinationStationId = useOnboardingStore((s) => s.destinationStationId);
  const setDestinationStation = useOnboardingStore((s) => s.setDestinationStation);
  const setMetroLine = useOnboardingStore((s) => s.setMetroLine);
  const [pending, setPending] = useState<Station | null>(null);

  return (
    <OnboardingScaffold
      step={6}
      stretch
      ctaLabel="Continue"
      ctaDisabled={!pending && !destinationStationId}
      onCta={() => router.push('/(onboarding)/schedule')}
    >
      <View style={{ gap: space.md, flex: 1 }}>
        <Text variant="h1">Where are you usually headed?</Text>
        <StationPicker
          placeholder="Search your destination"
          excludeStationId={homeStationId}
          selectedStationId={pending?.id ?? destinationStationId}
          onSelect={(station) => {
            setPending(station);
            setDestinationStation(station.id, station.name);
            setMetroLine(station.metro_line_id);
          }}
        />
      </View>
    </OnboardingScaffold>
  );
}
