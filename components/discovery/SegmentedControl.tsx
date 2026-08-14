import React from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radius, space } from '@/constants/spacing';

export interface Segment {
  key: string;
  label: string;
}

export function SegmentedControl({
  segments,
  selected,
  onSelect,
}: {
  segments: Segment[];
  selected: string;
  onSelect: (key: string) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {segments.map((segment) => {
        const active = segment.key === selected;
        return (
          <Pressable
            key={segment.key}
            onPress={() => onSelect(segment.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[styles.segment, active && styles.segmentActive]}
          >
            <Text variant="smallMedium" color={active ? 'textOnAccent' : 'textSecondary'}>
              {segment.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: space.xs, paddingVertical: space.sm },
  segment: {
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentActive: { backgroundColor: colors.interactive, borderColor: colors.interactive },
});
