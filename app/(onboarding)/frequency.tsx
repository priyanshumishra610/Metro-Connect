import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { OnboardingScaffold } from '@/components/onboarding/OnboardingScaffold';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radius, space } from '@/constants/spacing';
import { useOnboardingStore } from '@/store/onboardingStore';
import type { CommuteFrequency } from '@/types/database';

const OPTIONS: { value: CommuteFrequency; label: string; hint: string }[] = [
  { value: 'weekdays', label: 'Weekdays', hint: 'Monday to Friday, most weeks' },
  { value: 'three_to_four_days', label: '3–4 days a week', hint: 'A regular but flexible rhythm' },
  { value: 'few_days', label: 'A few days', hint: 'Roughly once or twice a week' },
  { value: 'occasionally', label: 'Occasionally', hint: 'Now and then' },
];

export default function FrequencyScreen() {
  const router = useRouter();
  const frequency = useOnboardingStore((s) => s.frequency);
  const setFrequency = useOnboardingStore((s) => s.setFrequency);

  return (
    <OnboardingScaffold
      step={9}
      stretch
      ctaLabel="Continue"
      ctaDisabled={!frequency}
      onCta={() => router.push('/(onboarding)/interests')}
    >
      <View style={{ gap: space.lg }}>
        <Text variant="h1">How often?</Text>
        <View style={{ gap: space.sm }}>
          {OPTIONS.map((option) => {
            const selected = frequency === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => setFrequency(option.value)}
                style={[styles.row, selected && styles.rowSelected]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <View style={{ flex: 1 }}>
                  <Text variant="bodySemiBold">{option.label}</Text>
                  <Text variant="small" color="textSecondary">{option.hint}</Text>
                </View>
                <View style={[styles.radio, selected && styles.radioSelected]} />
              </Pressable>
            );
          })}
        </View>
      </View>
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  rowSelected: { borderColor: colors.interactive, backgroundColor: colors.cardElevated },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.borderStrong },
  radioSelected: { borderColor: colors.interactive, backgroundColor: colors.interactive },
});
