import { useRouter } from 'expo-router';
import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthProviderButton, GoogleGlyph } from '@/components/auth/AuthProviderButton';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { voice } from '@/constants/copy';
import { radius, shadow, space } from '@/constants/spacing';
import { track } from '@/services/analytics';
import { signInWithGoogleOAuth } from '@/services/auth';
import { useGuestGateStore } from '@/store/guestGateStore';

export function GuestConversionSheet() {
  const visible = useGuestGateStore((s) => s.visible);
  const reason = useGuestGateStore((s) => s.reason);
  const close = useGuestGateStore((s) => s.close);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const body = voice.guestConversion[reason];

  const startSignup = (href: '/(auth)/phone' | '/(auth)/signup') => {
    track('guest_signup_started', { reason });
    close();
    router.push(href as never);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <Pressable style={styles.overlay} onPress={close} accessibilityLabel="Dismiss" />
      <View style={[styles.sheet, shadow.floating, { paddingBottom: insets.bottom + space.lg }]}>
        <View style={styles.handle} />
        <Icon name="lock" size={26} color={colors.interactive} />
        <Text variant="h2" style={{ marginTop: space.sm }}>
          Ready when you are.
        </Text>
        <Text variant="body" color="textSecondary" style={{ marginTop: space.xs, marginBottom: space.lg }}>
          {body}
        </Text>
        <View style={{ gap: space.sm }}>
          <AuthProviderButton
            label="Continue with Google"
            glyph={<GoogleGlyph />}
            onPress={async () => {
              track('guest_signup_started', { reason, method: 'google' });
              close();
              const result = await signInWithGoogleOAuth();
              if (result.error?.kind !== 'cancelled' && result.error) {
                // Welcome already has Google fallbacks; send them there.
              }
            }}
          />
          <AuthProviderButton label="Continue with Phone" icon="phone" onPress={() => startSignup('/(auth)/phone')} />
          <AuthProviderButton label="Create account" icon="mail" onPress={() => startSignup('/(auth)/signup')} />
          <Button label="Keep exploring" variant="ghost" onPress={close} />
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
