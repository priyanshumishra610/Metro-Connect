import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { StationPicker } from '@/components/onboarding/StationPicker';
import { Button } from '@/components/ui/Button';
import { InlineError } from '@/components/ui/InlineError';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radius, space } from '@/constants/spacing';
import { useAuth } from '@/hooks/useAuth';
import { listActiveCities } from '@/services/cities';
import { getPrimaryCommute, saveCommute } from '@/services/commute';
import { updateProfile } from '@/services/profiles';
import type { StationWithLine } from '@/services/stations';
import type { City, CommuteFrequency } from '@/types/database';

const FREQUENCY_OPTIONS: { value: CommuteFrequency; label: string }[] = [
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'three_to_four_days', label: '3–4 days a week' },
  { value: 'few_days', label: 'A few days' },
  { value: 'occasionally', label: 'Occasionally' },
];

export default function EditRoute() {
  const router = useRouter();
  const { profile, userId, isDemoMode } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [cities, setCities] = useState<City[]>([]);
  const [cityId, setCityId] = useState<string | null>(profile?.city_id ?? null);
  const [homeStation, setHomeStation] = useState<StationWithLine | null>(null);
  const [destinationStation, setDestinationStation] = useState<StationWithLine | null>(null);
  const [homeStationId, setHomeStationId] = useState<string | null>(null);
  const [destinationStationId, setDestinationStationId] = useState<string | null>(null);
  const [frequency, setFrequency] = useState<CommuteFrequency | null>(null);

  useEffect(() => {
    if (!userId) return;
    Promise.all([listActiveCities(), getPrimaryCommute(userId)]).then(([citiesResult, commuteResult]) => {
      setCities(citiesResult.data ?? []);
      if (commuteResult.data) {
        setHomeStationId(commuteResult.data.home_station_id);
        setDestinationStationId(commuteResult.data.destination_station_id);
        setFrequency(commuteResult.data.frequency);
      }
      setLoading(false);
    });
  }, [userId]);

  const onSave = async () => {
    const finalHomeId = homeStation?.id ?? homeStationId;
    const finalDestinationId = destinationStation?.id ?? destinationStationId;
    const finalLineId = homeStation?.metro_line_id;

    if (isDemoMode || !userId) {
      setError('Editing needs a real account — connect Supabase to save changes.');
      return;
    }
    if (!cityId || !finalHomeId || !finalDestinationId || !finalLineId || !frequency) {
      setError('Pick a city, home station, destination and frequency to save.');
      return;
    }

    setSaving(true);
    setError(null);

    const profileResult = await updateProfile(userId, { city_id: cityId });
    if (profileResult.error) {
      setSaving(false);
      setError(profileResult.error.message);
      return;
    }

    const commuteResult = await saveCommute(userId, {
      homeStationId: finalHomeId,
      destinationStationId: finalDestinationId,
      metroLineId: finalLineId,
      startTime: '07:30',
      endTime: '09:00',
      daysOfWeek: [1, 2, 3, 4, 5],
      frequency,
    });

    setSaving(false);
    if (commuteResult.error) return setError(commuteResult.error.message);
    setSuccess(true);
    setTimeout(() => router.back(), 700);
  };

  if (loading) {
    return (
      <ScreenContainer edges={['bottom']}>
        <ActivityIndicator style={{ marginTop: space.xl }} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['bottom']}>
      <ScrollView contentContainerStyle={{ paddingTop: space.md, paddingBottom: space.xl }} keyboardShouldPersistTaps="handled">
        <Text variant="label" color="textSecondary" style={styles.sectionLabel}>CITY</Text>
        <View style={{ gap: space.xs, marginBottom: space.lg }}>
          {cities.map((city) => {
            const selected = city.id === cityId;
            return (
              <Pressable
                key={city.id}
                onPress={() => setCityId(city.id)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={[styles.row, selected && styles.rowSelected]}
              >
                <Text variant="bodyMedium" style={{ flex: 1 }}>{city.name}</Text>
                {selected && <Icon name="check" size={18} color={colors.interactive} />}
              </Pressable>
            );
          })}
        </View>

        <Text variant="label" color="textSecondary" style={styles.sectionLabel}>HOME STATION</Text>
        <View style={{ height: 220, marginBottom: space.lg }}>
          <StationPicker
            cityId={cityId}
            placeholder="Search your home station"
            excludeStationId={destinationStation?.id ?? destinationStationId}
            selectedStationId={homeStation?.id ?? homeStationId}
            onSelect={(station) => {
              setHomeStation(station);
              setHomeStationId(station.id);
            }}
          />
        </View>

        <Text variant="label" color="textSecondary" style={styles.sectionLabel}>DESTINATION</Text>
        <View style={{ height: 220, marginBottom: space.lg }}>
          <StationPicker
            cityId={cityId}
            placeholder="Search your destination"
            excludeStationId={homeStation?.id ?? homeStationId}
            selectedStationId={destinationStation?.id ?? destinationStationId}
            onSelect={(station) => {
              setDestinationStation(station);
              setDestinationStationId(station.id);
            }}
          />
        </View>

        <Text variant="label" color="textSecondary" style={styles.sectionLabel}>HOW OFTEN</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs, marginBottom: space.lg }}>
          {FREQUENCY_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => setFrequency(option.value)}
              style={[styles.chip, frequency === option.value && styles.chipSelected]}
              accessibilityRole="button"
              accessibilityState={{ selected: frequency === option.value }}
            >
              <Text variant="smallMedium" color={frequency === option.value ? 'textPrimary' : 'textSecondary'}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {error && <InlineError message={error} />}
        {success && <Text variant="body" color="success">Route updated.</Text>}

        <Button label="Save" onPress={onSave} loading={saving} fullWidth />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionLabel: { marginBottom: space.xs, letterSpacing: 0.6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space.sm,
    paddingHorizontal: space.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowSelected: { borderColor: colors.interactive, backgroundColor: colors.cardElevated },
  chip: {
    paddingVertical: space.xs,
    paddingHorizontal: space.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: { borderColor: colors.interactive, backgroundColor: colors.cardElevated },
});
