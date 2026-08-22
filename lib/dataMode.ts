import { HAS_SUPABASE_CONFIG } from '@/config/env';

/**
 * Guest mode is a local-only session. It must never share a JWT with
 * Supabase, and every /services read of private user data must go through
 * shouldUseLocalData() so a configured backend is never queried for guests.
 */
let guestActive = false;

export function setGuestActive(value: boolean) {
  guestActive = value;
}

export function isGuestActive() {
  return guestActive;
}

/** True when the app must serve the isolated demo dataset instead of production. */
export function shouldUseLocalData() {
  return guestActive || !HAS_SUPABASE_CONFIG;
}
