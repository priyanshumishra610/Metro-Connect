# Truecaller sign-in setup

Android-only, one-tap phone verification. Fully wired, deployed, and
configured — the only thing left is a native build to actually run it (this
cannot run in Expo Go). See `DESIGN.md`/`PRODUCT.md` for why this is
Android-primary (Truecaller's iOS SDK is far more limited).

## Status: done except the native build

- ✅ Truecaller portal: project "Metro Connect" created, package name
  `com.metroconnect.app` and the debug keystore's SHA-1 fingerprint
  registered, Client ID confirmed no-secret (PKCE) design.
- ✅ `EXPO_PUBLIC_TRUECALLER_CLIENT_ID` set in `.env`.
- ✅ `supabase/functions/truecaller-verify` deployed (currently version 3)
  with the real Truecaller endpoints, confirmed from their own docs
  (`docs.truecaller.com/truecaller-sdk/android/oauth-sdk-3.0.0/integration-steps/integrating-with-your-backend`):
  - Token exchange: `POST https://oauth-account-noneu.truecaller.com/v1/token`
  - Profile fetch: `GET https://oauth-account-noneu.truecaller.com/v1/userinfo`
  - No client secret required — `client_id` + `code` + `code_verifier` (PKCE) is sufficient, confirmed directly from the docs' own curl example.
- ✅ `TRUECALLER_CLIENT_ID` secret set on the Supabase project.
- ⬜ **Native build** — the only remaining step, see below.
- ⬜ Move the Truecaller project from **Test** to **Production** mode in the
  portal once you're ready for real users (currently only registered test
  numbers can sign in).

## What's in the code

- `components/auth/TruecallerSignInButton.tsx` — Android only, and only
  when `EXPO_PUBLIC_TRUECALLER_CLIENT_ID` is set. Usability is checked
  before the SDK UI.
- `services/truecallerAuth.ts` — calls the Truecaller SDK, then hands the
  result to the Edge Function to verify and mint a Supabase session.
- `supabase/functions/truecaller-verify/index.ts` — exchanges the code,
  fetches the verified phone, creates/logs in the Supabase user (a
  deterministic pseudo-email is the vehicle for Supabase's email-only
  `generateLink()`/`verifyOtp()` API; the real phone number is still stored
  natively on `auth.users.phone`).
- `app.config.js` conditionally adds the Truecaller Expo plugin only when
  `EXPO_PUBLIC_TRUECALLER_CLIENT_ID` is set, so nothing breaks without it.
- `patches/@dhana-cs+react-native-truecaller+*.patch` — fixes a real bug in
  the installed package: its New Architecture code path required a file
  that was never shipped, which broke Metro's bundler outright the moment
  the button was wired into a screen (verified empirically). The patch
  makes it always use the package's classic-bridge implementation instead,
  which is complete. `patch-package` reapplies this automatically via
  `postinstall` — don't delete `patches/`, and if you ever upgrade this
  package, re-run `npx patch-package @dhana-cs/react-native-truecaller`
  after checking whether the upstream bug is fixed (if so, drop the patch).

## Native build (the one remaining step)

Truecaller requires a real native module and the Truecaller app installed
on the test device — emulators aren't supported by their SDK, and none of
this runs in Expo Go.

```bash
npx expo prebuild --platform android
npx expo run:android
```

or build a dev client via EAS. Test on a real Android device with the
Truecaller app installed and signed in.

## If something doesn't work

Email, Google, Phone, and Guest all work independently of Truecaller.
Truecaller is additive, never blocking. On Android the button is shown when
`EXPO_PUBLIC_TRUECALLER_CLIENT_ID` is set. Before any SDK UI, the app calls
`isUsable()`. If Truecaller is missing, the SDK fails, or credentials are
debug/release mismatched, the user sees:

> Truecaller isn't available on this device.
> You can still join Get Along using another method.

with Phone, Google, and Guest. They never get stuck on
"Truecaller is not usable on this device - is the app installed?"

If the flow fails after a usable SDK: check Edge Function logs
(`supabase functions logs truecaller-verify`). Failure codes
(`truecaller_token_exchange_failed`, `truecaller_profile_fetch_failed`,
`user_create_failed`, `session_mint_failed`) pinpoint the step.

Do not mix debug and release SHA-1 / Client IDs. Register both fingerprints
in the Truecaller console if you ship both a debug dev-client and a release
store build. Min SDK and package name must stay `com.metroconnect.app`.
