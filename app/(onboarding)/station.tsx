import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

import { OnboardingScaffold } from '@/components/onboarding/OnboardingScaffold';
import { StationPicker } from '@/components/onboarding/StationPicker';
import { Text } from '@/components/ui/Text';
import { space } from '@/constants/spacing';
import type { StationWithLine } from '@/services/stations';
import { useOnboardingStore } from '@/store/onboardingStore';

export default function StationScreen() {
  const router = useRouter();
  const cityId = useOnboardingStore((s) => s.cityId);
  const setHomeStation = useOnboardingStore((s) => s.setHomeStation);
  const setMetroLine = useOnboardingStore((s) => s.setMetroLine);
  const homeStationId = useOnboardingStore((s) => s.homeStationId);
  const [pending, setPending] = useState<StationWithLine | null>(null);

  return (
    <OnboardingScaffold
      step={6}
      stretch
      ctaLabel="Continue"
      ctaDisabled={!pending && !homeStationId}
      onCta={() => router.push('/(onboarding)/destination')}
    >
      <View style={{ gap: space.md, flex: 1 }}>
        <Text variant="h1">Where does your journey begin?</Text>
        <StationPicker
          cityId={cityId}
          placeholder="Search your home station"
          selectedStationId={pending?.id ?? homeStationId}
          onSelect={(station) => {
            setPending(station);
            setHomeStation(station.id, station.name);
            // The line you board on — the meaningful "your line" for matching, since a real commute may later cross onto another line at an interchange.
            setMetroLine(station.metro_line_id);
          }}
        />
      </View>
    </OnboardingScaffold>
  );
}
