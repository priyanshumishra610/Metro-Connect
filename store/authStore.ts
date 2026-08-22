import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

import { HAS_SUPABASE_CONFIG } from '@/config/env';
import { AUTH_COPY } from '@/lib/authErrors';
import { setGuestActive } from '@/lib/dataMode';
import { pingSupabase, withTimeout } from '@/lib/supabase';
import { track } from '@/services/analytics';
import { getSession, onAuthStateChange, signOut as signOutService } from '@/services/auth';
import { createGuestProfile, GUEST_PROFILE_ID } from '@/services/demoData';
import { getProfile } from '@/services/profiles';
import { useOnboardingStore } from '@/store/onboardingStore';
import type { Profile } from '@/types/database';

export type AuthStatus =
  | 'UNKNOWN'
  | 'LOADING'
  | 'GUEST'
  | 'AUTHENTICATED'
  | 'UNAUTHENTICATED'
  | 'AUTH_ERROR';

const GUEST_FLAG_KEY = 'metroconnect.guest_mode';
const SESSION_TIMEOUT_MS = 8000;

interface AuthState {
  status: AuthStatus;
  session: Session | null;
  profile: Profile | null;
  errorMessage: string | null;
  /** True when browsing the isolated guest/demo dataset. */
  isGuest: boolean;
  /** Alias kept for existing screens that skip production writes. */
  isDemoMode: boolean;
  bootstrap: () => Promise<void>;
  enterGuest: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  completeDemoOnboarding: () => void;
}

let authSubscriptionAttached = false;

async function loadProfileWithRetry(userId: string): Promise<Profile | null> {
  const first = await getProfile(userId);
  if (first.data) return first.data;
  await new Promise((resolve) => setTimeout(resolve, 700));
  const second = await getProfile(userId);
  return second.data ?? null;
}

async function readGuestFlag(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(GUEST_FLAG_KEY)) === '1';
  } catch {
    return false;
  }
}

async function writeGuestFlag(value: boolean): Promise<void> {
  try {
    if (value) await AsyncStorage.setItem(GUEST_FLAG_KEY, '1');
    else await AsyncStorage.removeItem(GUEST_FLAG_KEY);
  } catch {
    // Local flag is best-effort; guest still works in-memory.
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'UNKNOWN',
  session: null,
  profile: null,
  errorMessage: null,
  isGuest: false,
  isDemoMode: false,

  bootstrap: async () => {
    set({ status: 'LOADING', errorMessage: null });
    const guestFlag = await readGuestFlag();

    if (HAS_SUPABASE_CONFIG) {
      attachAuthListener();
      try {
        const session = await withTimeout(getSession(), SESSION_TIMEOUT_MS);
        if (session) {
          setGuestActive(false);
          await writeGuestFlag(false);
          let profile: Profile | null = null;
          try {
            profile = await withTimeout(loadProfileWithRetry(session.user.id), SESSION_TIMEOUT_MS);
          } catch {
            profile = null;
          }
          set({
            status: 'AUTHENTICATED',
            session,
            profile,
            isGuest: false,
            isDemoMode: false,
            errorMessage: null,
          });
          return;
        }
      } catch {
        if (guestFlag) {
          await applyGuest(set);
          return;
        }
        set({
          status: 'AUTH_ERROR',
          session: null,
          profile: null,
          isGuest: false,
          isDemoMode: false,
          errorMessage: AUTH_COPY.connectingTrouble,
        });
        return;
      }

      const reachable = await pingSupabase();
      if (!reachable) {
        if (guestFlag) {
          await applyGuest(set);
          return;
        }
        set({
          status: 'AUTH_ERROR',
          session: null,
          profile: null,
          isGuest: false,
          isDemoMode: false,
          errorMessage: AUTH_COPY.connectingTrouble,
        });
        return;
      }
    }

    if (guestFlag) {
      await applyGuest(set);
      return;
    }

    setGuestActive(false);
    set({
      status: 'UNAUTHENTICATED',
      session: null,
      profile: null,
      isGuest: false,
      isDemoMode: false,
      errorMessage: null,
    });
  },

  enterGuest: async () => {
    await applyGuest(set);
  },

  refreshProfile: async () => {
    const { session, isGuest } = get();
    if (isGuest || !session) return;
    const profile = await loadProfileWithRetry(session.user.id);
    if (profile) set({ profile });
  },

  signOut: async () => {
    const { isGuest } = get();
    if (isGuest) {
      setGuestActive(false);
      await writeGuestFlag(false);
      useOnboardingStore.getState().reset();
      set({
        status: 'UNAUTHENTICATED',
        session: null,
        profile: null,
        isGuest: false,
        isDemoMode: false,
        errorMessage: null,
      });
      return;
    }
    await signOutService();
    setGuestActive(false);
    await writeGuestFlag(false);
    set({
      status: 'UNAUTHENTICATED',
      session: null,
      profile: null,
      isGuest: false,
      isDemoMode: false,
      errorMessage: null,
    });
  },

  completeDemoOnboarding: () => {
    const { profile, isGuest } = get();
    if (!isGuest || !profile) return;
    set({ profile: { ...profile, is_profile_complete: true } });
  },
}));

type Setter = (partial: Partial<AuthState>) => void;

async function applyGuest(set: Setter) {
  setGuestActive(true);
  await writeGuestFlag(true);
  set({
    status: 'GUEST',
    session: null,
    profile: createGuestProfile(),
    isGuest: true,
    isDemoMode: true,
    errorMessage: null,
  });
}

function attachAuthListener() {
  if (authSubscriptionAttached || !HAS_SUPABASE_CONFIG) return;
  authSubscriptionAttached = true;

  onAuthStateChange(async (event, nextSession) => {
    const current = useAuthStore.getState();

    if (event === 'TOKEN_REFRESHED' && nextSession) {
      useAuthStore.setState({ session: nextSession });
      return;
    }

    if (nextSession) {
      const wasGuest = current.isGuest || current.status === 'GUEST';
      setGuestActive(false);
      await writeGuestFlag(false);
      if (wasGuest) {
        useOnboardingStore.getState().reset();
        track('guest_signup_completed');
      }
      const profile = await loadProfileWithRetry(nextSession.user.id);
      useAuthStore.setState({
        status: 'AUTHENTICATED',
        session: nextSession,
        profile,
        isGuest: false,
        isDemoMode: false,
        errorMessage: null,
      });
      return;
    }

    if (event === 'SIGNED_OUT' && current.status === 'AUTHENTICATED') {
      useAuthStore.setState({
        status: 'UNAUTHENTICATED',
        session: null,
        profile: null,
        isGuest: false,
        isDemoMode: false,
        errorMessage: AUTH_COPY.sessionExpired,
      });
    }
  });
}

export { GUEST_PROFILE_ID };
