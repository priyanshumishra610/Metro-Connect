/**
 * `react-native-google-mobile-ads` binds a native TurboModule the moment
 * it's imported — that native module only exists in a custom dev client or
 * a production build, never in Expo Go. A plain top-level
 * `import ... from 'react-native-google-mobile-ads'` therefore throws and
 * takes down the whole app (root layout included) before a single route can
 * render whenever someone runs this app in Expo Go.
 *
 * Every other ads file goes through this lazy, guarded loader instead of
 * importing the package directly, so a missing native module degrades to
 * "ads are quietly disabled" rather than a crash.
 */
import type * as GoogleMobileAds from 'react-native-google-mobile-ads';

let mod: typeof GoogleMobileAds | null = null;
let attempted = false;

export function loadAdsModule(): typeof GoogleMobileAds | null {
  if (attempted) return mod;
  attempted = true;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    mod = require('react-native-google-mobile-ads');
  } catch (error) {
    if (__DEV__) {
      console.warn(
        '[ads] react-native-google-mobile-ads native module is unavailable — this is expected in Expo Go. ' +
          'Ads stay disabled until this runs in a custom dev client or a production build.'
      );
    }
    mod = null;
  }

  return mod;
}

export function isAdsModuleAvailable(): boolean {
  return loadAdsModule() !== null;
}
