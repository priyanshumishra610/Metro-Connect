import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { colors } from '@/constants/colors';
import { springs } from '@/constants/motion';
import { fontFamily } from '@/constants/typography';

const ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  index: 'home',
  discover: 'compass',
  connections: 'users',
  messages: 'message-circle',
  profile: 'user',
};

function TabIcon({ name, color, focused }: { name: keyof typeof Feather.glyphMap; color: string; focused: boolean }) {
  const scale = useSharedValue(1);
  const lift = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.1 : 1, springs.momentum);
    lift.value = withSpring(focused ? -2 : 0, springs.momentum);
  }, [focused, lift, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: lift.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Feather name={name} color={color} size={22} />
    </Animated.View>
  );
}

/** A flat, flush tab bar — a crisp top border does the separation work instead of a shadow or blur, matching the editorial ink-on-paper world. */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.textPrimary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarItemStyle: { paddingTop: 2 },
        tabBarLabelStyle: { fontFamily: fontFamily.bodySemiBold, fontSize: 10.5, letterSpacing: 0.2 },
        tabBarIcon: ({ color, focused }) => <TabIcon name={ICONS[route.name]} color={color as string} focused={focused} />,
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
