import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

import { colors } from '@/constants/colors';
import { fontFamily } from '@/constants/typography';

const ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  index: 'home',
  discover: 'compass',
  connections: 'users',
  messages: 'message-circle',
  profile: 'user',
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.interactive,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 58,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontFamily: fontFamily.bodyMedium, fontSize: 11 },
        tabBarIcon: ({ color, size }) => <Feather name={ICONS[route.name]} color={color} size={size ? size - 2 : 20} />,
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="discover" options={{ title: 'Discover' }} />
      <Tabs.Screen name="connections" options={{ title: 'Connections' }} />
      <Tabs.Screen name="messages" options={{ title: 'Messages' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
