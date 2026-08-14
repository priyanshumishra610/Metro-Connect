import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radius, space } from '@/constants/spacing';

export function MessageBubble({ body, mine }: { body: string; mine: boolean }) {
  return (
    <View style={[styles.row, { justifyContent: mine ? 'flex-end' : 'flex-start' }]}>
      <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
        <Text variant="body" color={mine ? 'textOnAccent' : 'textPrimary'}>
          {body}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginVertical: 3 },
  bubble: { maxWidth: '78%', paddingHorizontal: space.sm, paddingVertical: space.xs + 2, borderRadius: radius.lg },
  mine: { backgroundColor: colors.interactive, borderBottomRightRadius: 6 },
  theirs: { backgroundColor: colors.card, borderBottomLeftRadius: 6, borderWidth: 1, borderColor: colors.border },
});
