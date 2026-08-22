import { IS_DEV } from '@/config/env';

/**
 * Centralized analytics event list. Thin, swappable sink — point `sink` at
 * Amplitude/PostHog/Segment/etc. when one is chosen. Never call a
 * third-party SDK directly from a screen.
 *
 * Hard rule: never pass passwords, OTP values, OAuth tokens, message
 * bodies, precise coordinates, or other sensitive personal data.
 */
export type AnalyticsEvent =
  | 'app_open'
  | 'auth_started'
  | 'auth_succeeded'
  | 'auth_failed'
  | 'auth_cancelled'
  | 'google_started'
  | 'google_succeeded'
  | 'google_failed'
  | 'google_cancelled'
  | 'truecaller_started'
  | 'truecaller_succeeded'
  | 'truecaller_failed'
  | 'truecaller_unavailable'
  | 'truecaller_fallback_shown'
  | 'phone_started'
  | 'phone_code_sent'
  | 'phone_verified'
  | 'phone_failed'
  | 'phone_resend'
  | 'guest_started'
  | 'guest_home_viewed'
  | 'guest_discovery_viewed'
  | 'guest_profile_viewed'
  | 'guest_connection_attempted'
  | 'guest_signup_started'
  | 'guest_signup_completed'
  | 'login_started'
  | 'login_completed'
  | 'signup_started'
  | 'signup_completed'
  | 'commute_created'
  | 'interest_selected'
  | 'profile_completed'
  | 'discovery_opened'
  | 'profile_viewed'
  | 'connection_requested'
  | 'connection_accepted'
  | 'message_sent'
  | 'dating_lobby_opened'
  | 'referral_shared'
  | 'referral_opened'
  | 'referral_completed'
  | 'ad_impression'
  | 'rewarded_ad_completed'
  | 'account_deleted'
  | 'update_checked'
  | 'update_downloaded'
  | 'update_failed'
  | 'update_applied';

type EventProps = Record<string, string | number | boolean | undefined>;

let sink: (event: AnalyticsEvent, props?: EventProps) => void = (event, props) => {
  if (IS_DEV) {
    // eslint-disable-next-line no-console
    console.log('[analytics]', event, props ?? {});
  }
};

export function setAnalyticsSink(next: typeof sink) {
  sink = next;
}

export function track(event: AnalyticsEvent, props?: EventProps) {
  sink(event, props);
}
