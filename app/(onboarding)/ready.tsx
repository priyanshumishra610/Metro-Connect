import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

import { MetroRouteVisual } from '@/components/metro/MetroRouteVisual';
import { OnboardingScaffold } from '@/components/onboarding/OnboardingScaffold';
import { InlineError } from '@/components/ui/InlineError';
import { Text } from '@/components/ui/Text';
import { space } from '@/constants/spacing';
import { useAuth } from '@/hooks/useAuth';
import { saveCommute } from '@/services/commute';
import { setUserInterests } from '@/services/interests';
import { markProfileComplete } from '@/services/profiles';
import { recordReferralEvent } from '@/services/referrals';
import { useOnboardingStore } from '@/store/onboardingStore';

export default function ReadyScreen() {
  const router = useRouter();
  const { userId, isDemoMode, completeDemoOnboarding, refreshProfile } = useAuth();
  const onboarding = useOnboardingStore();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finish = async () => {
    if (isDemoMode) {
      completeDemoOnboarding();
      router.replace('/(tabs)');
      return;
    }

    if (!userId || !onboarding.homeStationId || !onboarding.destinationStationId || !onboarding.metroLineId || !onboarding.frequency) {
      setError('Something went wrong. Try again in a moment.');
      return;
    }

    setSaving(true);
    setError(null);

    const commuteResult = await saveCommute(userId, {
      homeStationId: onboarding.homeStationId,
      destinationStationId: onboarding.destinationStationId,
      metroLineId: onboarding.metroLineId,
      startTime: onboarding.startTime,
      endTime: onboarding.endTime,
      daysOfWeek: [1, 2, 3, 4, 5],
      frequency: onboarding.frequency,
    });

    if (commuteResult.error) {
      setSaving(false);
      setError(commuteResult.error.message);
      return;
    }

    await setUserInterests(userId, onboarding.interestIds);
    await markProfileComplete(userId);
    await recordReferralEvent('', 'commute_created', userId).catch(() => {});
    await refreshProfile();

    setSaving(false);
    onboarding.reset();
    router.replace('/(tabs)');
  };

  return (
    <OnboardingScaffold step={10} ctaLabel="Let's see who's on my route" ctaLoading={saving} onCta={finish} showBack={false}>
      <View style={{ alignItems: 'center', gap: space.xl }}>
        <Text variant="display" style={{ textAlign: 'center' }}>You're ready.</Text>

        <MetroRouteVisual
          homeLabel={onboarding.homeStationName ?? 'Home station'}
          destinationLabel={onboarding.destinationStationName ?? 'Destination'}
        />

        <Text variant="bodyLarge" color="textSecondary" style={{ textAlign: 'center' }}>
          Let's see who's already riding with you.
        </Text>

        {error && <InlineError message={error} />}
      </View>
    </OnboardingScaffold>
  );
}
