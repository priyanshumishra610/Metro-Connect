import { useAuthStore } from '@/store/authStore';
import { useGuestGateStore, type ConversionReason } from '@/store/guestGateStore';
import { track } from '@/services/analytics';

export function useAuth() {
  const status = useAuthStore((s) => s.status);
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const isGuest = useAuthStore((s) => s.isGuest);
  const isDemoMode = useAuthStore((s) => s.isDemoMode);
  const errorMessage = useAuthStore((s) => s.errorMessage);
  const signOut = useAuthStore((s) => s.signOut);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const completeDemoOnboarding = useAuthStore((s) => s.completeDemoOnboarding);
  const enterGuest = useAuthStore((s) => s.enterGuest);
  const bootstrap = useAuthStore((s) => s.bootstrap);

  return {
    status,
    session,
    profile,
    isGuest,
    isDemoMode,
    errorMessage,
    userId: profile?.id ?? session?.user.id ?? null,
    isSignedIn: status === 'AUTHENTICATED',
    signOut,
    refreshProfile,
    completeDemoOnboarding,
    enterGuest,
    bootstrap,
  };
}

export function useGuestGate() {
  const isGuest = useAuthStore((s) => s.isGuest);
  const open = useGuestGateStore((s) => s.open);

  const guard = (reason: ConversionReason = 'default') => {
    if (!isGuest) return true;
    if (reason === 'connection') track('guest_connection_attempted');
    open(reason);
    return false;
  };

  return { isGuest, guard, open };
}
