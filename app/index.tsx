import { Redirect } from 'expo-router';
import React from 'react';

import { useAuth } from '@/hooks/useAuth';

export default function Index() {
  const { status, profile } = useAuth();

  if (status === 'UNKNOWN' || status === 'LOADING') return null;
  if (status === 'AUTH_ERROR') return <Redirect href={'/(auth)/connection-trouble' as never} />;
  if (status === 'UNAUTHENTICATED') return <Redirect href="/(auth)/welcome" />;
  if (status === 'GUEST') return <Redirect href="/(tabs)" />;
  if (status === 'AUTHENTICATED' && !profile?.is_profile_complete) {
    return <Redirect href="/(onboarding)/story-1" />;
  }
  if (status === 'AUTHENTICATED') return <Redirect href="/(tabs)" />;
  return <Redirect href="/(auth)/welcome" />;
}
