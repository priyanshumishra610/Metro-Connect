// Dynamic config (replaces app.json) — needed because the Truecaller plugin
// must read its Client ID from an env var at build/prebuild time, which a
// static app.json can't do. Everything else here is a direct port of the
// previous app.json.

/** @type {import('expo/config').ExpoConfig} */
const baseConfig = {
  name: 'Metro Connect',
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
      backgroundColor: '#FBF9F5',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
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
        androidAppId: 'ca-app-pub-3940256099942544~3347511713',
        iosAppId: 'ca-app-pub-3940256099942544~1458002511',
        userTrackingUsageDescription: 'This identifier is used to show you ads that are more relevant to you.',
      },
    ],
    '@react-native-community/datetimepicker',
    // Truecaller's Expo plugin throws at config-evaluation time if given no
    // clientId — so it's only added once EXPO_PUBLIC_TRUECALLER_CLIENT_ID is
    // set (see docs/TRUECALLER_SETUP.md). Without it, the app builds exactly
    // as before; the Truecaller button just has nothing to call.
    ...(process.env.EXPO_PUBLIC_TRUECALLER_CLIENT_ID
      ? [['@dhana-cs/react-native-truecaller', { clientId: process.env.EXPO_PUBLIC_TRUECALLER_CLIENT_ID }]]
      : []),
  ],
  experiments: {
    typedRoutes: true,
  },
};

module.exports = { expo: baseConfig };
