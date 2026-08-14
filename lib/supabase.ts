import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

import { HAS_SUPABASE_CONFIG, SUPABASE_ANON_KEY, SUPABASE_URL } from '@/config/env';

/**
 * The single Supabase client for the app. Every /services module goes
 * through this — no screen should import @supabase/supabase-js directly
 * (brief §14).
 *
 * When credentials aren't configured (local dev without a .env), we still
 * construct a client against a harmless placeholder URL so imports don't
 * crash the bundler; every service function checks HAS_SUPABASE_CONFIG
 * first and falls back to demo data instead of letting a network call fail.
 */
export const supabase = createClient(
  HAS_SUPABASE_CONFIG ? SUPABASE_URL : 'https://placeholder.supabase.co',
  HAS_SUPABASE_CONFIG ? SUPABASE_ANON_KEY : 'public-anon-key-placeholder',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
