import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
  DMSans_800ExtraBold,
} from '@expo-google-fonts/dm-sans';
import { Bangers_400Regular } from '@expo-google-fonts/bangers';
import {
  Fraunces_500Medium,
  Fraunces_500Medium_Italic,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from '@expo-google-fonts/fraunces';
import { useFonts } from 'expo-font';
import * as Linking from 'expo-linking';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Ensures the in-app browser sheet used by Google OAuth (services/auth.ts)
// reliably closes itself after redirecting back, instead of lingering.
WebBrowser.maybeCompleteAuthSession();

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
    Fraunces_500Medium,
    Fraunces_500Medium_Italic,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    DMSans_800ExtraBold,
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
        <StatusBar style="dark" />
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
