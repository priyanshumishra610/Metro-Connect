import { useRouter } from 'expo-router';
import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthProviderButton, GoogleGlyph } from '@/components/auth/AuthProviderButton';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { AUTH_COPY } from '@/lib/authErrors';
import { radius, shadow, space } from '@/constants/spacing';
import { track } from '@/services/analytics';
import { useAuthStore } from '@/store/authStore';

export function TruecallerFallbackSheet({
  visible,
  onClose,
  onGoogle,
}: {
  visible: boolean;
  onClose: () => void;
  onGoogle: () => void;
}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const enterGuest = useAuthStore((s) => s.enterGuest);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} accessibilityLabel="Dismiss" />
      <View style={[styles.sheet, shadow.floating, { paddingBottom: insets.bottom + space.lg }]}>
        <View style={styles.handle} />
        <Icon name="smartphone" size={28} color={colors.info} />
        <Text variant="h2" style={{ marginTop: space.sm }}>
          {AUTH_COPY.truecallerUnavailable}
        </Text>
        <Text variant="body" color="textSecondary" style={{ marginTop: space.xs, marginBottom: space.lg }}>
          {AUTH_COPY.truecallerUnavailableBody}
        </Text>
        <View style={{ gap: space.sm }}>
          <AuthProviderButton
            label="Continue with Phone"
            icon="phone"
            onPress={() => {
              onClose();
              router.push('/(auth)/phone' as never);
            }}
          />
          <AuthProviderButton
            label="Continue with Google"
            glyph={<GoogleGlyph />}
            onPress={() => {
              onClose();
              onGoogle();
            }}
          />
          <AuthProviderButton
            label="Continue as Guest"
            icon="user"
            onPress={async () => {
              onClose();
              track('guest_started');
              await enterGuest();
            }}
          />
          <Button label="Close" variant="ghost" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    marginBottom: space.md,
  },
});
