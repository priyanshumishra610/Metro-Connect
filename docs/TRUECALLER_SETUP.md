# Truecaller sign-in setup

Android-only, one-tap phone verification. Fully wired in code — what's left
is credential setup in two places and a native build (this cannot run in
Expo Go). See `DESIGN.md`/`PRODUCT.md` for why this is Android-primary
(Truecaller's iOS SDK is far more limited).

## What's already done

- `components/auth/TruecallerSignInButton.tsx` — renders only on Android,
  and only when the native module actually loaded (see below).
- `services/truecallerAuth.ts` — calls the Truecaller SDK, then hands the
  result to a Supabase Edge Function to verify and mint a session.
- `supabase/functions/truecaller-verify/index.ts` — the server-side half
  (exchanges the code, fetches the verified phone, creates/logs in the
  Supabase user). **Has two placeholder URLs you must fill in** — see step 3.
- `app.config.js` conditionally adds the Truecaller Expo plugin only when
  `EXPO_PUBLIC_TRUECALLER_CLIENT_ID` is set, so nothing breaks without it.
- `patches/@dhana-cs+react-native-truecaller+*.patch` — fixes a real bug
  found in the installed package: its New Architecture code path required a
  file that was never shipped, which broke Metro's bundler outright the
  moment the button was actually wired into a screen (verified empirically,
  not just suspected). The patch makes it always use the package's classic-
  bridge implementation, which is complete and doesn't have this problem.
  `patch-package` reapplies this automatically via `postinstall` — don't
  delete the `patches/` folder, and if you ever upgrade this package, re-run
  `npx patch-package @dhana-cs/react-native-truecaller` after checking
  whether the upstream bug is fixed (if so, delete the patch).

## 1. Truecaller Developer Portal

Create an app at Truecaller's developer portal. You'll get:
- A **Client ID** (not secret — this is what identifies your app to
  Truecaller, embedded in the built APK the same way an AdMob app ID is).
- A **Client Secret** (secret — used only server-side, see step 4).

Set the Client ID:
```
EXPO_PUBLIC_TRUECALLER_CLIENT_ID=your-client-id
```
in `.env`.

## 2. Native build (not Expo Go)

Truecaller requires a real native module and the Truecaller app installed
on the test device (emulators aren't supported by their SDK). Once the
Client ID is set:
```bash
npx expo prebuild --platform android
npx expo run:android
```
or build a dev client via EAS. Emulators won't work — test on a real
Android device with the Truecaller app installed.

## 3. Fill in the Truecaller API endpoints

I could not confirm Truecaller's current OAuth token-exchange and profile
endpoint URLs from public documentation, and would rather leave an honest
placeholder than ship a guessed one that fails silently. In
`supabase/functions/truecaller-verify/index.ts`, replace:

```ts
const TRUECALLER_TOKEN_URL = 'https://REPLACE_ME.truecaller.com/oauth2/token';
const TRUECALLER_PROFILE_URL = 'https://REPLACE_ME.truecaller.com/v1/userinfo';
```

with the exact URLs from your Truecaller developer dashboard's
backend/server-side integration docs (available once your app is approved).

## 4. Deploy the Edge Function

```bash
supabase functions deploy truecaller-verify
supabase secrets set TRUECALLER_CLIENT_ID=your-client-id
supabase secrets set TRUECALLER_CLIENT_SECRET=your-client-secret
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are
auto-injected into every Edge Function by Supabase — nothing to set there.

## 5. Test, with a real fallback already in place

Email and Google sign-in both work independently of all of this — Truecaller
is additive. If something in this flow doesn't work on first try (a wrong
endpoint URL, a portal approval still pending), the app is not blocked;
the button simply won't render if the native module or credentials aren't
present, per `isTruecallerAvailable()` in `services/truecallerAuth.ts`.
