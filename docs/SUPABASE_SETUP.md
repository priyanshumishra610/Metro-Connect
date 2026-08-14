# Supabase setup

Metro Connect has no credentials baked in (brief §82) — without this, the app
still runs in **demo mode** against local seed data (see `services/demoData.ts`
and the "Demo mode" banner), so you can review every screen before wiring up
a real backend.

## 1. Create a project

Create a project at [supabase.com](https://supabase.com). Grab, from
Project Settings → API:

- Project URL
- `anon` `public` key
- `service_role` key (**server-side only, never in the app** — needed for
  the seed script)

## 2. Run the migrations

In the Supabase SQL editor, run these in order:

1. `supabase/migrations/0001_schema.sql`
2. `supabase/migrations/0002_functions.sql`
3. `supabase/migrations/0003_rls.sql`
4. `supabase/migrations/0004_storage.sql` — creates the public `avatars` bucket and its policies
5. `supabase/migrations/0005_account_deletion.sql`

(Or point the Supabase CLI's `supabase db push` at this `supabase/migrations`
folder if you have a project linked.)

## 3. Configure the app

```bash
cp .env.example .env
```

Fill in:

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Restart `npx expo start` after editing `.env` — Expo only reads it at boot.

## 4. Seed development data (optional)

The seed script needs the **service-role** key, which is why it's a separate,
non-`EXPO_PUBLIC_` variable read only by a local Node script, never bundled
into the app:

```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # service_role, not anon
```

Add those two lines to the same `.env`, then:

```bash
npm run seed
```

This creates one city (Delhi), one metro system/line, four stations, the
interest catalog, and six demo commuters (Aarav, Meera, Rohan, Ananya,
Kabir, Sara — from brief §67) with real auth accounts
(`aarav@metroconnect.demo` / `MetroConnectDemo123!`, etc.) so discovery,
connections, and chat all have real rows to work against.

## 5. Google Sign-In

`services/auth.ts` exposes `signInWithGoogleIdToken()`, which does the
Supabase half of the exchange. It needs a native Google OAuth client (e.g.
`@react-native-google-signin/google-signin` or `expo-auth-session`) wired to
real OAuth client IDs, which are per-project credentials this repo
intentionally does not invent (brief §13, §82) — add that package, configure
the client IDs in your Supabase Auth provider settings, and call this
function with the ID token it returns.

## 6. Account deletion — the missing half

`services/account.ts` → `deleteAccount()` strips personal data immediately
via the `anonymize_own_account()` RPC. Actually deleting the `auth.users` row
needs the Supabase Admin API (`supabase.auth.admin.deleteUser(id)`), which
requires the service-role key and therefore **cannot run from the app**. Stand
up a small server-side function (a Supabase Edge Function is the natural
choice) that calls it, and point `deleteAccount()` at that endpoint once it
exists.

## 7. AdMob

Development always uses Google's official test ad unit IDs
(`react-native-google-mobile-ads`'s built-in `TestIds`) — see
`config/ads.ts`. For a real production build, create ad units in your AdMob
console and set:

```
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_ADMOB_APP_ID=...
EXPO_PUBLIC_ADMOB_BANNER_ID=...
EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID=...
EXPO_PUBLIC_ADMOB_REWARDED_ID=...
```

You'll also need to replace the placeholder `androidAppId`/`iosAppId` in the
`react-native-google-mobile-ads` plugin block in `app.json` with your real
AdMob app IDs before a production build — those two are native manifest
values Expo bakes in at prebuild time, so they can't come from an env var.

AdMob requires a custom dev client or a full native build
(`npx expo run:ios` / `npx expo run:android` or an EAS build) — it does not
work inside Expo Go.
