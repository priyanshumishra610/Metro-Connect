// Dynamic config (replaces app.json) — needed because the Truecaller plugin
// must read its Client ID from an env var at build/prebuild time, which a
// static app.json can't do. Everything else here is a direct port of the
// previous app.json.

// Google's official public test AdMob App IDs (safe to hardcode — not
// secrets). Used whenever EXPO_PUBLIC_APP_ENV isn't "production" or a real
// App ID hasn't been set — same safety fallback config/ads.ts uses for ad
// unit IDs, so a build never silently ships without ads misconfigured.
const isAdMobProduction = process.env.EXPO_PUBLIC_APP_ENV === 'production';
const admobAndroidAppId =
  (isAdMobProduction && process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID) || 'ca-app-pub-3940256099942544~3347511713';
const admobIosAppId =
  (isAdMobProduction && process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID) || 'ca-app-pub-3940256099942544~1458002511';

/** @type {import('expo/config').ExpoConfig} */
const baseConfig = {
  name: 'Get Along: Metro Connect',
  slug: 'metro-connect',
  scheme: 'metroconnect',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  backgroundColor: '#FBF9F5',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.metroconnect.app',
    infoPlist: {
      UIBackgroundModes: [],
    },
  },
  android: {
    package: 'com.metroconnect.app',
    adaptiveIcon: {
      // Sampled from the icon artwork's own corner pixel so any edge the
      // adaptive mask crops blends in rather than showing a mismatched ring.
      backgroundColor: '#0B0B15',
      foregroundImage: './assets/android-icon-foreground.png',
    },
    predictiveBackGestureEnabled: false,
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [{ scheme: 'metroconnect' }],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: [
    'expo-router',
    'expo-font',
    'expo-secure-store',
    'expo-updates',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#FBF9F5',
        image: './assets/splash-icon.png',
        imageWidth: 140,
      },
    ],
    [
      'react-native-google-mobile-ads',
      {
        // Bug fix: these were hardcoded to the test IDs regardless of env,
        // silently ignoring the admobAndroidAppId/admobIosAppId computed
        // above — a production build would have shipped test ads forever.
        androidAppId: admobAndroidAppId,
        iosAppId: admobIosAppId,
        userTrackingUsageDescription: 'This identifier is used to show you ads that are more relevant to you.',
      },
    ],
    '@react-native-community/datetimepicker',
    // Truecaller's Expo plugin throws at config-evaluation time if given no
    // clientId — so it's only added once EXPO_PUBLIC_TRUECALLER_CLIENT_ID is
    // set (see docs/TRUECALLER_SETUP.md). Without it, the app builds exactly
    // as before; the Truecaller button just has nothing to call.
    //
    // Pointed at the plugin file directly (not the bare package name): the
    // package ships no app.plugin.js, so Expo's resolver falls back to
    // loading the package's runtime entry point as if it might be a plugin
    // — which broke `expo config`/`expo-doctor`/prebuild with a module-
    // format error, even though it never affected the Metro bundler (a
    // separate code path that doesn't evaluate config plugins at all).
    ...(process.env.EXPO_PUBLIC_TRUECALLER_CLIENT_ID
      ? [
          [
            '@dhana-cs/react-native-truecaller/plugins/withTruecaller',
            { clientId: process.env.EXPO_PUBLIC_TRUECALLER_CLIENT_ID },
          ],
        ]
      : []),
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: 'def8ecfb-0854-4666-87b8-060505d2ef7e',
    },
    criticalUpdate: false,
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
  updates: {
    url: 'https://u.expo.dev/def8ecfb-0854-4666-87b8-060505d2ef7e',
    enabled: true,
    checkAutomatically: 'NEVER',
    fallbackToCacheTimeout: 0,
  },
};

module.exports = { expo: baseConfig };
