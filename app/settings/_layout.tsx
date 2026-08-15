import { Stack } from 'expo-router';
import React from 'react';

import { colors } from '@/constants/colors';
import { fontFamily } from '@/constants/typography';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontFamily: fontFamily.displaySemiBold, fontSize: 17 },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Settings' }} />
      <Stack.Screen name="edit-profile" options={{ title: 'Edit profile' }} />
      <Stack.Screen name="invite" options={{ title: 'Invite' }} />
      <Stack.Screen name="delete-account" options={{ title: 'Delete account' }} />
    </Stack>
  );
}
