import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radius, shadow, space } from '@/constants/spacing';
import { applyDownloadedUpdate } from '@/services/updates';

export function CriticalUpdateOverlay({ visible }: { visible: boolean }) {
  const insets = useSafeAreaInsets();
  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade">
      <View style={[styles.overlay, { paddingBottom: insets.bottom + space.lg }]}>
        <View style={[styles.card, shadow.floating]}>
          <Icon name="refresh" size={28} color={colors.interactive} />
          <Text variant="h2" style={{ marginTop: space.sm }}>
            {`We've got an important update for you.`}
          </Text>
          <Text variant="body" color="textSecondary" style={{ marginTop: space.xs, marginBottom: space.lg }}>
            Restart Get Along to continue.
          </Text>
          <Button label="Update now" onPress={() => applyDownloadedUpdate()} fullWidth />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    paddingHorizontal: space.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
