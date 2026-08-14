import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const status = useAuthStore((s) => s.status);
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const isDemoMode = useAuthStore((s) => s.isDemoMode);
  const signOut = useAuthStore((s) => s.signOut);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const completeDemoOnboarding = useAuthStore((s) => s.completeDemoOnboarding);

  return {
    status,
    session,
    profile,
    isDemoMode,
    userId: profile?.id ?? session?.user.id ?? null,
    isSignedIn: status === 'signedIn',
    signOut,
    refreshProfile,
    completeDemoOnboarding,
  };
}
