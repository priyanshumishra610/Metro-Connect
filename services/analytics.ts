import { IS_DEV } from '@/config/env';

/**
 * Centralized analytics event list (brief §58). This is intentionally a
 * thin, swappable sink — point `sink` at Amplitude/PostHog/Segment/etc. when
 * one is chosen. Never call a third-party SDK directly from a screen.
 *
 * Hard rule: never pass message bodies, precise coordinates, or other
 * sensitive personal data as a property.
 */
export type AnalyticsEvent =
  | 'app_open'
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
  | 'account_deleted';

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
