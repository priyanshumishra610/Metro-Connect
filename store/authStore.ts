import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

import { HAS_SUPABASE_CONFIG } from '@/config/env';
import { getSession, onAuthStateChange, signOut as signOutService } from '@/services/auth';
import { getProfile } from '@/services/profiles';
import type { Profile } from '@/types/database';

export type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

interface AuthState {
  status: AuthStatus;
  session: Session | null;
  profile: Profile | null;
  /** True when there are no Supabase credentials configured — the app runs
   * against a synthetic local profile so the UI stays fully explorable
   * (brief §82: never claim a live integration that isn't configured; the
   * DemoModeBanner keeps this visible to whoever is looking at the screen). */
  isDemoMode: boolean;
  bootstrap: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  /** Demo mode has no backend to persist onboarding to — this just flips the local flag so the golden path (onboarding → home) stays fully explorable without credentials. */
  completeDemoOnboarding: () => void;
}

const DEMO_PROFILE: Profile = {
  id: 'demo-you',
  username: 'you',
  display_name: 'You',
  avatar_url: null,
  bio: null,
  profession: null,
  education: null,
  city_id: 'demo-city',
  is_profile_complete: false,
  is_identity_verified: false,
  is_commute_verified: false,
  is_dating_opted_in: false,
  founding_commuter_number: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'loading',
  session: null,
  profile: null,
  isDemoMode: !HAS_SUPABASE_CONFIG,

  bootstrap: async () => {
    if (!HAS_SUPABASE_CONFIG) {
      set({ status: 'signedIn', profile: DEMO_PROFILE, isDemoMode: true });
      return;
    }

    const session = await getSession();
    if (session) {
      const { data: profile } = await getProfile(session.user.id);
      set({ status: 'signedIn', session, profile });
    } else {
      set({ status: 'signedOut', session: null, profile: null });
    }

    onAuthStateChange(async (nextSession) => {
      if (nextSession) {
        const { data: profile } = await getProfile(nextSession.user.id);
        set({ status: 'signedIn', session: nextSession, profile });
      } else {
        set({ status: 'signedOut', session: null, profile: null });
      }
    });
  },

  refreshProfile: async () => {
    const { session, isDemoMode } = get();
    if (isDemoMode || !session) return;
    const { data: profile } = await getProfile(session.user.id);
    if (profile) set({ profile });
  },

  signOut: async () => {
    if (get().isDemoMode) return;
    await signOutService();
    set({ status: 'signedOut', session: null, profile: null });
  },

  completeDemoOnboarding: () => {
    const { profile, isDemoMode } = get();
    if (!isDemoMode || !profile) return;
    set({ profile: { ...profile, is_profile_complete: true, founding_commuter_number: 1 } });
  },
}));
