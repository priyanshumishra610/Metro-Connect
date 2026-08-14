import { Redirect } from 'expo-router';
import React from 'react';

import { useAuth } from '@/hooks/useAuth';

export default function Index() {
  const { status, profile } = useAuth();

  if (status === 'loading') return null;
  if (status === 'signedOut') return <Redirect href="/(auth)/welcome" />;
  if (!profile?.is_profile_complete) return <Redirect href="/(onboarding)/story-1" />;
  return <Redirect href="/(tabs)" />;
}
