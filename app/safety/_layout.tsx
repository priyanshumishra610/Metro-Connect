import { Stack } from 'expo-router';
import React from 'react';

import { colors } from '@/constants/colors';
import { fontFamily } from '@/constants/typography';

export default function SafetyLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontFamily: fontFamily.displaySemiBold, fontSize: 17 },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Safety Center' }} />
      <Stack.Screen name="report" options={{ title: 'Report', presentation: 'modal' }} />
      <Stack.Screen name="blocked" options={{ title: 'Blocked' }} />
    </Stack>
  );
}
