import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import { HAS_SUPABASE_CONFIG, SUPABASE_ANON_KEY, SUPABASE_URL } from '@/config/env';
import { authStorage } from '@/lib/sessionStorage';

/**
 * The single Supabase client for the app. Every /services module goes
 * through this — no screen should import @supabase/supabase-js directly.
 *
 * When credentials aren't configured, we still construct a client against a
 * harmless placeholder URL so imports don't crash the bundler. Services
 * must check shouldUseLocalData() / HAS_SUPABASE_CONFIG before networking.
 */
export const supabase = createClient(
  HAS_SUPABASE_CONFIG ? SUPABASE_URL : 'https://placeholder.supabase.co',
  HAS_SUPABASE_CONFIG ? SUPABASE_ANON_KEY : 'public-anon-key-placeholder',
  {
    auth: {
      storage: authStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: Platform.OS === 'web',
      flowType: 'pkce',
    },
  }
);

const HEALTH_TIMEOUT_MS = 5000;

/** Lightweight reachability check. Does not log response bodies. */
export async function pingSupabase(): Promise<boolean> {
  if (!HAS_SUPABASE_CONFIG) return false;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);
    const response = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
      method: 'GET',
      headers: { apikey: SUPABASE_ANON_KEY },
      signal: controller.signal,
    });
    clearTimeout(timer);
    return response.ok;
  } catch {
    return false;
  }
}

export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}
