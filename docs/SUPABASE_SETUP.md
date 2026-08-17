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
6. `supabase/migrations/0006_metro_network_data.sql` — real cities/lines/stations for Delhi (NCR), Bengaluru, and Kochi, replacing the single placeholder line the first migration shipped with

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

This looks up Delhi and its real Blue Line (seeded by migration 0006 — run
that first) and creates the interest catalog plus six demo commuters (Aarav,
Meera, Rohan, Ananya, Kabir, Sara — from brief §67) riding Rajiv Chowk →
Dwarka Sector 21, with real auth accounts (`aarav@metroconnect.demo` /
`MetroConnectDemo123!`, etc.) so discovery, connections, and chat all have
real rows to work against.

## 5. Google Sign-In

`services/auth.ts` → `signInWithGoogleOAuth()` and the "Continue with
Google" button on the Welcome/Login/Signup screens are fully wired in code
— what's left is a one-time credential setup in two dashboards. No native
Google SDK is used (it's Supabase's hosted OAuth flow via
`expo-web-browser`), so this works in Expo Go as well as a dev
client/production build.

**a. Google Cloud Console** (console.cloud.google.com → APIs & Services →
Credentials):
1. Create an OAuth 2.0 Client ID (type: **Web application** — yes, even
   though this is a mobile app; Supabase is the actual OAuth client Google
   talks to).
2. Authorized redirect URI: `https://oofpefsqpjhsxemntrnn.supabase.co/auth/v1/callback`
3. Note the generated Client ID and Client Secret.

**b. Supabase Dashboard** (Authentication → Providers → Google):
1. Enable Google, paste in the Client ID and Client Secret from above.
2. Authentication → URL Configuration → Redirect URLs: add
   `metroconnect://auth-callback` for dev-client/production builds. For
   testing in Expo Go, also add a wildcard for the Expo proxy domain
   (`exp://*`) — Expo Go's redirect URL changes with your dev session, so
   this is the only way it stays whitelisted; a dev client or production
   build doesn't have this problem since `metroconnect://auth-callback` is
   fixed.

Nothing else to change in the app — `makeRedirectUri({ path: 'auth-callback' })`
in `services/auth.ts` already resolves to the right URL for whichever
environment it's running in.

## 6. Account deletion — the missing half

`services/account.ts` → `deleteAccount()` strips personal data immediately
via the `anonymize_own_account()` RPC. Actually deleting the `auth.users` row
needs the Supabase Admin API (`supabase.auth.admin.deleteUser(id)`), which
requires the service-role key and therefore **cannot run from the app**. Stand
up a small server-side function (a Supabase Edge Function is the natural
choice) that calls it, and point `deleteAccount()` at that endpoint once it
exists.

## 7. AdMob

See [`docs/ADMOB_SETUP.md`](ADMOB_SETUP.md) — App ID and ad unit IDs, both
now settable purely via `.env` (no code edits needed). Same rule as
everywhere else: it doesn't work inside Expo Go, needs a dev client or full
native build.
