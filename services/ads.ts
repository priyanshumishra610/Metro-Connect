import AsyncStorage from '@react-native-async-storage/async-storage';

import { adUnitIds } from '@/config/ads';
import { loadAdsModule } from '@/lib/nativeAds';
import { track } from '@/services/analytics';

/**
 * Centralized ad gateway (brief §57) — screens never touch
 * react-native-google-mobile-ads directly. This is also the one place that
 * knows the placement rules from §53/§55: never onboarding, never inside a
 * connection request or conversation, never a safety screen, never right
 * after signup, and interstitials are frequency-capped.
 *
 * Every native call is guarded through loadAdsModule() (see
 * lib/nativeAds.ts) so running in Expo Go — where the native AdMob module
 * doesn't exist — quietly disables ads instead of crashing the app.
 */

export type AdSurface =
  | 'onboarding'
  | 'auth'
  | 'connection_request'
  | 'conversation'
  | 'safety'
  | 'post_signup'
  | 'discovery_feed'
  | 'home'
  | 'discover_tab_switch'
  | 'connections_list';

const NEVER_ELIGIBLE: ReadonlySet<AdSurface> = new Set([
  'onboarding',
  'auth',
  'connection_request',
  'conversation',
  'safety',
  'post_signup',
]);

const MIN_MS_BETWEEN_INTERSTITIALS = 3 * 60 * 1000;
const MAX_INTERSTITIALS_PER_SESSION = 3;
const LAST_SHOWN_KEY = 'metroconnect:ads:lastInterstitialShownAt';

let initialized = false;
let sessionInterstitialCount = 0;
let consentGranted = true; // Wire to AdsConsent (UMP) result once a real Publisher ID is configured.

export const AdManager = {
  isNativeModuleAvailable(): boolean {
    return loadAdsModule() !== null;
  },

  async initialize(): Promise<void> {
    if (initialized) return;
    const mod = loadAdsModule();
    if (!mod) return;
    await mod.MobileAds().initialize();
    initialized = true;
  },

  setConsent(granted: boolean) {
    consentGranted = granted;
  },

  /** Whether a banner is allowed to render at all on this surface — the <AdBanner/> component checks this before mounting. */
  isBannerEligible(surface: AdSurface): boolean {
    return this.isNativeModuleAvailable() && consentGranted && !NEVER_ELIGIBLE.has(surface);
  },

  bannerUnitId(): string {
    return adUnitIds.banner;
  },

  async showInterstitialIfEligible(surface: AdSurface): Promise<boolean> {
    const mod = loadAdsModule();
    if (!mod || !consentGranted || NEVER_ELIGIBLE.has(surface)) return false;
    if (sessionInterstitialCount >= MAX_INTERSTITIALS_PER_SESSION) return false;

    const lastShownRaw = await AsyncStorage.getItem(LAST_SHOWN_KEY);
    const lastShown = lastShownRaw ? Number(lastShownRaw) : 0;
    if (Date.now() - lastShown < MIN_MS_BETWEEN_INTERSTITIALS) return false;

    return new Promise((resolve) => {
      const interstitial = mod.InterstitialAd.createForAdRequest(adUnitIds.interstitial);
      let settled = false;

      const cleanup = interstitial.addAdEventsListener(({ type }) => {
        if (type === mod.AdEventType.LOADED) {
          interstitial.show();
        } else if (type === mod.AdEventType.CLOSED || type === mod.AdEventType.ERROR) {
          if (!settled) {
            settled = true;
            cleanup();
            resolve(type === mod.AdEventType.CLOSED);
          }
        }
      });

      sessionInterstitialCount += 1;
      AsyncStorage.setItem(LAST_SHOWN_KEY, String(Date.now()));
      track('ad_impression', { surface });

      interstitial.load();
    });
  },

  /**
   * The user must have explicitly tapped something like "Watch a short ad
   * to unlock a boost" before this is ever called — rewarded ads never
   * auto-play (brief §54).
   */
  async showRewarded(): Promise<{ rewarded: boolean }> {
    const mod = loadAdsModule();
    if (!mod || !consentGranted) return { rewarded: false };

    return new Promise((resolve) => {
      const rewarded = mod.RewardedAd.createForAdRequest(adUnitIds.rewarded);
      let earned = false;

      const cleanup = rewarded.addAdEventsListener(({ type }) => {
        if (type === mod.RewardedAdEventType.LOADED) {
          rewarded.show();
        } else if (type === mod.RewardedAdEventType.EARNED_REWARD) {
          earned = true;
          track('rewarded_ad_completed');
        } else if (type === mod.AdEventType.CLOSED || type === mod.AdEventType.ERROR) {
          cleanup();
          resolve({ rewarded: earned });
        }
      });

      rewarded.load();
    });
  },
};
