/**
 * Auth copy shown to humans. Technical SDK strings never reach the UI.
 */

const TECHNICAL =
  /oauth error|authsessionmissingerror|authretryablefetcherror|invalid jwt|refresh.?token|access.?token|pkce|supabase|provider is not enabled|unsupported provider|unexpected_failure|invalid_grant|invalid_request/i;

export const AUTH_COPY = {
  googleFailed: "Google couldn't sign you in right now.",
  googleCancelled: 'Google sign-in was cancelled.',
  truecallerUnavailable: "Truecaller isn't available on this device.",
  truecallerUnavailableBody: 'You can still join Get Along using another method.',
  truecallerFailed: "Truecaller couldn't sign you in right now.",
  phoneSendFailed: "We couldn't send a code right now. Try another method.",
  phoneInvalid: "That code didn't match. Try again.",
  phoneExpired: 'That code expired. Request a new one.',
  phoneRateLimited: 'Too many attempts. Wait a minute and try again.',
  phoneNetwork: "We're having trouble connecting.",
  connectingTrouble: "We're having trouble connecting.",
  connectingTroubleBody: 'You can retry, or explore Get Along as a guest.',
  emailMismatch: "Email or password doesn't match.",
  cancelled: 'Sign-in was cancelled.',
  sessionExpired: 'Your session expired. Sign in again to continue.',
} as const;

export function isTechnicalAuthMessage(message: string | undefined | null): boolean {
  if (!message) return true;
  return TECHNICAL.test(message);
}

export function userAuthMessage(message: string | undefined | null, fallback: string): string {
  if (!message || isTechnicalAuthMessage(message)) return fallback;
  return fallback;
}
