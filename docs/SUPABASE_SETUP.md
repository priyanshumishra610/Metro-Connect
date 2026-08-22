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
7. `supabase/migrations/0007_guest_isolation.sql` — revokes `anon` on private tables so guests cannot query production users

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
Google" button are fully wired. Google client secrets stay in the Supabase
dashboard, never in the app.

The app reads `EXPO_PUBLIC_SUPABASE_URL` and rewrites the known typo host
`supase.co` → `supabase.co`. The value must still be your real project URL:

`https://oofpefsqpjhsxemntrnn.supabase.co`

**a. Google Cloud Console** (APIs & Services → Credentials):
1. Create an OAuth 2.0 Client ID (type: **Web application**. Supabase is the
   OAuth client Google talks to).
2. Authorized redirect URI:
   `https://oofpefsqpjhsxemntrnn.supabase.co/auth/v1/callback`
   (must be `supabase.co`, never `supase.co`)
3. Note the Client ID and Client Secret.

**b. Supabase Dashboard** (Authentication → Providers → Google):
1. Enable Google, paste the Client ID and Client Secret.
2. Authentication → URL Configuration:
   - Site URL: `metroconnect://auth-callback`
   - Additional Redirect URLs (add all of these):
     - `metroconnect://auth-callback`
     - `metroconnect://reset-password`
     - `exp://127.0.0.1:8081/--/auth-callback` (Expo Go on simulator)
     - `exp://*` only if you must test Google inside Expo Go (the proxy
       URL changes per session)

The redirect scheme is read from `app.config.js` (`scheme: 'metroconnect'`),
not from a copied example.

If Google sign-in fails, the app shows "Google couldn't sign you in right
now." with Try again / Use another method. Guest mode still works if Auth
is down.

## 5b. Phone OTP

Authentication → Providers → Phone: enable SMS. Configure an SMS provider
(Twilio/MessageBird/etc.) in the dashboard. The app never reveals whether a
number is already registered. Resend uses a 60s cooldown.

## 5c. Guest mode and RLS

Guests have no JWT. They only see the local demo dataset. Migration
`0007_guest_isolation.sql` revokes `anon` on private tables. Apply it after
the project is running (`supabase db push` or the SQL editor). Do not copy
guest demo rows onto a real account after signup.

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
