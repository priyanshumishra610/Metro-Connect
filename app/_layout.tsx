import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { Bangers_400Regular } from '@expo-google-fonts/bangers';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { useFonts } from 'expo-font';
import * as Linking from 'expo-linking';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useCallback, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DemoModeBanner } from '@/components/system/DemoModeBanner';
import { colors } from '@/constants/colors';
import { AdManager } from '@/services/ads';
import { recordReferralEvent } from '@/services/referrals';
import { useAuthStore } from '@/store/authStore';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const authStatus = useAuthStore((s) => s.status);

  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Bangers_400Regular,
  });

  useEffect(() => {
    bootstrap();
    AdManager.initialize();
  }, [bootstrap]);

  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      const { queryParams, path } = Linking.parse(url);
      if (path?.startsWith('invite/')) {
        const code = path.replace('invite/', '') || (queryParams?.code as string | undefined);
        if (code) recordReferralEvent(code, 'opened');
      }
    });
    return () => subscription.remove();
  }, []);

  const ready = fontsLoaded && authStatus !== 'loading';

  const onLayoutRootView = useCallback(async () => {
    if (ready) await SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <DemoModeBanner />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="profile/[userId]" options={{ presentation: 'card' }} />
          <Stack.Screen name="conversation/[id]" options={{ presentation: 'card' }} />
          <Stack.Screen name="connection/[id]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="invite/[code]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="safety" options={{ presentation: 'card' }} />
          <Stack.Screen name="dating-lobby" options={{ presentation: 'card' }} />
          <Stack.Screen name="settings" options={{ presentation: 'card' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
