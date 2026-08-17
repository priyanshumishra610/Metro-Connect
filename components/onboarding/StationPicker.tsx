import { Icon } from '@/components/ui/Icon';
import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { searchStations, type StationWithLine } from '@/services/stations';
import { colors } from '@/constants/colors';
import { radius, space } from '@/constants/spacing';

export interface StationPickerProps {
  cityId?: string | null;
  excludeStationId?: string | null;
  selectedStationId?: string | null;
  onSelect: (station: StationWithLine) => void;
  placeholder: string;
}

export function StationPicker({ cityId, excludeStationId, selectedStationId, onSelect, placeholder }: StationPickerProps) {
  const [query, setQuery] = useState('');
  const [stations, setStations] = useState<StationWithLine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    searchStations(query, cityId ?? undefined).then((result) => {
      if (cancelled) return;
      setLoading(false);
      if (result.data) setStations(result.data.filter((s) => s.id !== excludeStationId));
    });
    return () => {
      cancelled = true;
    };
  }, [query, cityId, excludeStationId]);

  return (
    <View style={{ flex: 1 }}>
      <TextField
        placeholder={placeholder}
        value={query}
        onChangeText={setQuery}
        autoCorrect={false}
        returnKeyType="search"
      />
      <FlatList
        data={stations}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          !loading ? (
            <Text variant="body" color="textSecondary" style={{ paddingVertical: space.md }}>
              No stations match "{query}".
            </Text>
          ) : null
        }
        renderItem={({ item }) => {
          const selected = item.id === selectedStationId;
          const lineColor = item.metro_lines?.color_hex ?? colors.interactive;
          return (
            <Pressable
              onPress={() => onSelect(item)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={[styles.row, selected && styles.rowSelected]}
            >
              <View style={[styles.dot, { backgroundColor: lineColor }]} />
              <View style={{ flex: 1 }}>
                <Text variant="bodyMedium">{item.name}</Text>
                {item.metro_lines?.name && (
                  <Text variant="small" color="textSecondary">
                    {item.metro_lines.name}
                  </Text>
                )}
              </View>
              {selected && <Icon name="check" size={18} color={colors.interactive} />}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: space.sm,
    paddingHorizontal: space.sm,
    borderRadius: radius.md,
  },
  rowSelected: { backgroundColor: colors.card },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.interactive },
});
