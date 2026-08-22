import Constants from 'expo-constants';
import { makeRedirectUri } from 'expo-auth-session';

/**
 * Redirect used for Supabase OAuth. The scheme is read from the running
 * app config (app.config.js `scheme`), never from a copied example.
 * This URI must be listed under Supabase Authentication > URL Configuration
 * > Additional Redirect URLs.
 */
export function getAppScheme(): string {
  const scheme = Constants.expoConfig?.scheme;
  if (typeof scheme === 'string' && scheme.length > 0) return scheme;
  if (Array.isArray(scheme) && typeof scheme[0] === 'string') return scheme[0];
  return 'metroconnect';
}

export function getAuthCallbackPath() {
  return 'auth-callback';
}

export function getAuthRedirectUri() {
  return makeRedirectUri({
    scheme: getAppScheme(),
    path: getAuthCallbackPath(),
  });
}

export function getPasswordResetRedirectUri() {
  return `${getAppScheme()}://reset-password`;
}
