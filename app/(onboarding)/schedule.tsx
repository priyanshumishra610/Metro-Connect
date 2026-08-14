import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { OnboardingScaffold } from '@/components/onboarding/OnboardingScaffold';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radius, space } from '@/constants/spacing';
import { useOnboardingStore } from '@/store/onboardingStore';

const PRESETS = [
  { label: '6:30 – 8:00 AM', start: '06:30', end: '08:00' },
  { label: '7:30 – 9:00 AM', start: '07:30', end: '09:00' },
  { label: '8:30 – 10:00 AM', start: '08:30', end: '10:00' },
  { label: '5:30 – 7:00 PM', start: '17:30', end: '19:00' },
  { label: '6:30 – 8:00 PM', start: '18:30', end: '20:00' },
];

function toDate(hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function toHHMM(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function formatDisplay(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

export default function ScheduleScreen() {
  const router = useRouter();
  const startTime = useOnboardingStore((s) => s.startTime);
  const endTime = useOnboardingStore((s) => s.endTime);
  const setTimeWindow = useOnboardingStore((s) => s.setTimeWindow);

  const [customOpen, setCustomOpen] = useState(false);
  const [editingField, setEditingField] = useState<'start' | 'end' | null>(null);

  const activePreset = PRESETS.find((p) => p.start === startTime && p.end === endTime);

  return (
    <OnboardingScaffold step={7} stretch ctaLabel="Continue" onCta={() => router.push('/(onboarding)/frequency')}>
      <View style={{ gap: space.lg }}>
        <Text variant="h1">When do you usually travel?</Text>

        <View style={{ gap: space.sm }}>
          {PRESETS.map((preset) => {
            const selected = preset.start === startTime && preset.end === endTime && !customOpen;
            return (
              <Pressable
                key={preset.label}
                onPress={() => {
                  setCustomOpen(false);
                  setTimeWindow(preset.start, preset.end);
                }}
                style={[styles.row, selected && styles.rowSelected]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text variant="bodyMedium" color={selected ? 'textPrimary' : 'textSecondary'}>
                  {preset.label}
                </Text>
              </Pressable>
            );
          })}

          <Pressable
            onPress={() => setCustomOpen(true)}
            style={[styles.row, (customOpen || !activePreset) && styles.rowSelected]}
            accessibilityRole="button"
          >
            <Text variant="bodyMedium">Custom — {formatDisplay(startTime)} to {formatDisplay(endTime)}</Text>
          </Pressable>
        </View>

        {customOpen && (
          <View style={{ flexDirection: 'row', gap: space.md }}>
            <Pressable style={styles.timeBox} onPress={() => setEditingField('start')}>
              <Text variant="caption" color="textSecondary">START</Text>
              <Text variant="h3">{formatDisplay(startTime)}</Text>
            </Pressable>
            <Pressable style={styles.timeBox} onPress={() => setEditingField('end')}>
              <Text variant="caption" color="textSecondary">END</Text>
              <Text variant="h3">{formatDisplay(endTime)}</Text>
            </Pressable>
          </View>
        )}

        {editingField && (
          <DateTimePicker
            value={toDate(editingField === 'start' ? startTime : endTime)}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, date) => {
              if (Platform.OS === 'android') setEditingField(null);
              if (!date) return;
              const value = toHHMM(date);
              setTimeWindow(editingField === 'start' ? value : startTime, editingField === 'end' ? value : endTime);
            }}
          />
        )}
      </View>
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  rowSelected: { borderColor: colors.interactive, backgroundColor: colors.cardElevated },
  timeBox: {
    flex: 1,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
});
