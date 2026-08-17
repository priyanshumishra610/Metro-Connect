import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { ComicLabel } from '@/components/ui/ComicLabel';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { space } from '@/constants/spacing';

export interface ConnectionCelebrationProps {
  visible: boolean;
  personName: string;
  personAvatarUrl?: string | null;
  onSayHello: () => void;
  onDismiss: () => void;
}

/**
 * The comic-accent moment brief §26 originally specified but never actually
 * shipped: "IT'S A CONNECTION." on mutual accept. A real Modal (not an
 * in-screen overlay) so it covers the tab bar too — this is the one moment
 * in the app meant to fully take over the screen for a second.
 */
export function ConnectionCelebration({ visible, personName, personAvatarUrl, onSayHello, onDismiss }: ConnectionCelebrationProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.backdrop}>
        <Animated.View entering={FadeIn.duration(220)} style={StyleSheet.absoluteFill}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} accessibilityLabel="Dismiss" />
        </Animated.View>

        <Animated.View entering={ZoomIn.duration(360).springify().damping(16)} style={styles.card}>
          <Avatar name={personName} imageUrl={personAvatarUrl} size={72} verified />
          <ComicLabel text="IT'S A CONNECTION." size="medium" tone="founding" />
          <Text variant="bodyLarge" style={{ textAlign: 'center' }}>
            You and {personName} both commute the same route.
          </Text>
          <Text variant="body" color="textSecondary" style={{ textAlign: 'center' }}>
            Start with something easy.
          </Text>

          <View style={styles.actions}>
            <Button label="Say hello" onPress={onSayHello} fullWidth />
            <Pressable onPress={onDismiss} hitSlop={8} style={{ marginTop: space.sm }}>
              <Text variant="smallMedium" color="textSecondary">Later</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.lg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.xl,
    alignItems: 'center',
    gap: space.sm,
  },
  actions: {
    width: '100%',
    marginTop: space.md,
    alignItems: 'center',
  },
});
