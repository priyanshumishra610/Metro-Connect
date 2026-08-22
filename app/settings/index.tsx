import { Icon, type IconName } from '@/components/ui/Icon';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { space } from '@/constants/spacing';
import { useAuth, useGuestGate } from '@/hooks/useAuth';
import { track } from '@/services/analytics';

export default function Settings() {
  const router = useRouter();
  const { signOut, isGuest } = useAuth();
  const { open } = useGuestGate();

  return (
    <ScreenContainer edges={['bottom']}>
      <View style={{ gap: space.xs, marginTop: space.sm }}>
        <Row
          icon="user"
          label="Edit profile"
          onPress={() => {
            if (isGuest) open('profile');
            else router.push('/settings/edit-profile');
          }}
        />
        <Row icon="map-pin" label="Edit your route" onPress={() => router.push('/settings/edit-route')} />
        <Row icon="gift" label="Invite from your route" onPress={() => router.push('/settings/invite')} />
        <Row icon="shield" label="Safety Center" onPress={() => router.push('/safety')} />
        <Row icon="lock" label="Privacy" onPress={() => router.push('/safety')} />
        {!isGuest && <Row icon="heart" label="Dating Lobby" onPress={() => router.push('/dating-lobby')} />}
      </View>

      <View style={{ marginTop: space.xxl, gap: space.xs }}>
        {isGuest ? (
          <>
            <Row
              icon="user-plus"
              label="Create an account"
              onPress={() => {
                track('guest_signup_started');
                open('default');
              }}
            />
            <Row
              icon="log-out"
              label="Leave guest mode"
              onPress={async () => {
                await signOut();
                router.replace('/');
              }}
            />
          </>
        ) : (
          <Row
            icon="log-out"
            label="Sign out"
            onPress={async () => {
              await signOut();
              router.replace('/');
            }}
          />
        )}
        <Row
          icon="trash-2"
          label="Delete account"
          onPress={() => {
            if (isGuest) open('profile');
            else router.push('/settings/delete-account');
          }}
          destructive
        />
      </View>
    </ScreenContainer>
  );
}

function Row({
  icon,
  label,
  onPress,
  destructive,
  disabled,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.row, disabled && { opacity: 0.4 }]} accessibilityRole="button">
      <Icon name={icon} size={18} color={destructive ? colors.danger : colors.textPrimary} />
      <Text variant="bodyMedium" color={destructive ? 'danger' : 'textPrimary'} style={{ flex: 1 }}>
        {label}
      </Text>
      <Icon name="chevron-right" size={18} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: space.sm + 2,
    paddingHorizontal: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
