import { Redirect, Stack } from 'expo-router';
import React from 'react';

import { useAuthStore } from '@/store/authStore';

export default function AuthLayout() {
  const status = useAuthStore((s) => s.status);
  if (status === 'GUEST' || status === 'AUTHENTICATED') {
    return <Redirect href="/" />;
  }
  return <Stack screenOptions={{ headerShown: false }} />;
}
