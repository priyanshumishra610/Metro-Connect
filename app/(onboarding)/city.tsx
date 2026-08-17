import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { OnboardingScaffold } from '@/components/onboarding/OnboardingScaffold';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radius, space } from '@/constants/spacing';
import { listActiveCities } from '@/services/cities';
import { useOnboardingStore } from '@/store/onboardingStore';
import type { City } from '@/types/database';

export default function CityScreen() {
  const router = useRouter();
  const cityId = useOnboardingStore((s) => s.cityId);
  const setCity = useOnboardingStore((s) => s.setCity);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listActiveCities().then((result) => {
      setCities(result.data ?? []);
      setLoading(false);
    });
  }, []);

  return (
    <OnboardingScaffold
      step={5}
      stretch
      ctaLabel="Continue"
      ctaDisabled={!cityId}
      onCta={() => router.push('/(onboarding)/station')}
    >
      <View style={{ gap: space.md, flex: 1 }}>
        <Text variant="h1">Which city do you commute in?</Text>

        {loading ? (
          <ActivityIndicator style={{ marginTop: space.xl }} />
        ) : (
          <FlatList
            data={cities}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const selected = item.id === cityId;
              return (
                <Pressable
                  onPress={() => setCity(item.id, item.name)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={[styles.row, selected && styles.rowSelected]}
                >
                  <Text variant="bodyMedium" style={{ flex: 1 }}>
                    {item.name}
                  </Text>
                  {selected && <Icon name="check" size={18} color={colors.interactive} />}
                </Pressable>
              );
            }}
          />
        )}
      </View>
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: space.sm + 2,
    paddingHorizontal: space.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: space.xs,
  },
  rowSelected: { borderColor: colors.interactive, backgroundColor: colors.cardElevated },
});
