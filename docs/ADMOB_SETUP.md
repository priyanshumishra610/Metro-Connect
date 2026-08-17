# AdMob setup

Development already works with zero setup — the app defaults to Google's
official test IDs everywhere until you explicitly flip it to production.
This doc is what you need for a real, revenue-generating build.

## What's actually wired up right now

Only **banner ads** render anywhere in the app — `components/ads/AdBanner.tsx`,
placed on the Home and Discover screens (`AdBanner surface="home"` /
`surface="discovery_feed"`). `AdManager.showInterstitialIfEligible()` and
`AdManager.showRewarded()` are fully built (frequency capping, placement
rules from brief §53–55) but nothing calls them yet — so you only need a
**banner ad unit** to match what's actually live. Interstitial/rewarded ad
units are optional until those get wired into a real screen.

## 1. Create the app in AdMob

console.admob.google.com → Apps → Add app, once per platform (Android and
iOS are separate apps in AdMob, each with its own App ID). This is where
your app's package name (`com.metroconnect.app`) gets registered.

You'll get an **App ID** per platform, shaped like
`ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY`.

## 2. Create a banner ad unit

Inside the Android app you just created → Ad units → Add ad unit → Banner.
You'll get an **Ad unit ID**, shaped like
`ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ` (same publisher ID as the App ID,
different suffix). One is enough — the same banner placement is reused on
both screens.

## 3. Set the env vars

```
EXPO_PUBLIC_ADMOB_ANDROID_APP_ID=ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY
EXPO_PUBLIC_ADMOB_IOS_APP_ID=ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY
EXPO_PUBLIC_ADMOB_BANNER_ID=ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ
EXPO_PUBLIC_APP_ENV=production
```

That last line matters more than it looks: `EXPO_PUBLIC_APP_ENV` is the
switch. Setting the App ID / ad unit IDs alone does nothing while it's
still `development` — `config/ads.ts` and `app.config.js` both only use
your real IDs when `APP_ENV=production`, and silently keep using Google's
test IDs otherwise. This is deliberate (never accidentally ship a
half-configured production ad slot), but it means people forget this line
more often than the IDs themselves.

## 4. Rebuild natively

The App ID is a native manifest value (`AndroidManifest.xml` meta-data /
iOS `Info.plist`), not something read at JS runtime — it only takes effect
via `expo prebuild`, which regenerates the native project from
`app.config.js`. If you've already prebuilt for Truecaller, just rebuild
again after setting these vars:

```bash
npx expo prebuild --platform android
npx expo run:android
```

Doesn't work in Expo Go, same as Truecaller — needs a dev client or full
build either way.

## 5. Before you actually publish

- **Never click your own production ads.** Google can suspend your account
  for invalid traffic, even accidental self-clicks during testing — always
  test with `EXPO_PUBLIC_APP_ENV=development` (Google's test ads) or a
  device added to AdMob's test device list.
- Google's consent/UMP (User Messaging Platform) flow for regional privacy
  requirements (GDPR, etc.) is **not implemented yet** — `AdManager.setConsent()`
  exists as a hook but nothing calls Google's actual UMP SDK to determine
  real consent status. Worth flagging before a production launch in a
  regulated region; ask if you want this built out.
