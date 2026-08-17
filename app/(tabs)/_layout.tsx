import { Icon, type IconName } from '@/components/ui/Icon';
import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router';
import React, { useEffect, type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type GestureResponderEvent, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { colors } from '@/constants/colors';
import { duration, springs } from '@/constants/motion';
import { radius } from '@/constants/spacing';
import { fontFamily } from '@/constants/typography';

const ICONS: Record<string, IconName> = {
  index: 'home',
  discover: 'compass',
  connections: 'users',
  messages: 'message-circle',
  profile: 'user',
};

function TabIcon({ name, color, focused }: { name: IconName; color: string; focused: boolean }) {
  const scale = useSharedValue(1);
  const lift = useSharedValue(0);
  const pillScale = useSharedValue(0.6);
  const pillOpacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.08 : 1, springs.momentum);
    lift.value = withSpring(focused ? -1 : 0, springs.momentum);
    pillScale.value = withSpring(focused ? 1 : 0.6, springs.momentum);
    pillOpacity.value = withTiming(focused ? 1 : 0, { duration: duration.fast });
  }, [focused, lift, pillOpacity, pillScale, scale]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: lift.value }],
  }));
  const pillStyle = useAnimatedStyle(() => ({
    opacity: pillOpacity.value,
    transform: [{ scale: pillScale.value }],
  }));

  return (
    <View style={styles.iconSlot}>
      <Animated.View style={[styles.pill, pillStyle]} />
      <Animated.View style={iconStyle}>
        <Icon name={name} color={color} size={22} />
      </Animated.View>
    </View>
  );
}

/**
 * Haptic feedback on tab switch — native tab bars do this, React Navigation
 * doesn't by default. Typed against just the handful of props React
 * Navigation's BottomTabBarButtonProps actually passes, rather than
 * importing that type directly — @react-navigation/bottom-tabs isn't
 * hoisted as a direct dependency here (expo-router pulls it in transitively).
 */
interface TabBarButtonProps {
  children?: ReactNode;
  onPress?: (e: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  accessibilityState?: { selected?: boolean };
  [key: string]: unknown;
}

function HapticTabButton({ onPress, ...rest }: TabBarButtonProps) {
  return (
    <Pressable
      {...rest}
      onPress={(e) => {
        Haptics.selectionAsync();
        onPress?.(e);
      }}
    />
  );
}

/** A flat, flush tab bar — a crisp top border does the separation work instead of a shadow or blur, matching the editorial ink-on-paper world. Active tab gets a soft pill behind its icon so state reads at a glance, not just from a color/label change. */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.textPrimary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarButton: HapticTabButton,
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

const styles = StyleSheet.create({
  iconSlot: {
    width: 44,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    position: 'absolute',
    width: 44,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(47, 92, 255, 0.1)',
  },
});
