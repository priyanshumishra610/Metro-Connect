# Metro Connect

> Meet the people already riding with you.

A hyperlocal social network built around repeated real-world proximity —
matching people on their actual commute (same station, same line, same time
window) instead of momentary "who's nearby." See [`PRODUCT.md`](PRODUCT.md)
for the full product brief and principles.

## Stack

Expo (React Native) + TypeScript, Supabase (Postgres, Auth, RLS, Storage,
Realtime), Expo Router (navigation + deep linking), React Native Reanimated,
Google AdMob via `react-native-google-mobile-ads`, Zustand.

## Quickstart

```bash
npm install
npx expo start
```

Without a `.env`, the app opens on the sign-in screen. **Continue as Guest**
loads an isolated demo dataset (Aarav, Meera, Rohan, Ananya, Kabir, Sara)
and never queries production users. To connect a real Supabase project, follow
[`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md). Over-the-air JS updates:
[`docs/OTA.md`](docs/OTA.md).

## Project structure

```
app/            Expo Router routes — thin screens that compose /screens & /components
components/     Reusable UI: design-system primitives, onboarding, discovery, chat, metro visuals
services/       The only layer allowed to talk to Supabase — auth, profiles, discovery, etc.
store/          Zustand state (auth session, in-progress onboarding answers)
hooks/          Data-fetching hooks built on top of /services
constants/      Design tokens — colors, typography, spacing, motion, product copy
types/          Hand-written types mirroring the Postgres schema
supabase/       SQL migrations (schema, functions, RLS, storage) + the dev seed script
config/         Env var access, ad unit configuration
docs/           Setup guides
```

## Design system

Dark-first, an original comic-book/metro-signage visual language (never a
real transit authority's branding) — tokens live in `constants/colors.ts`,
`constants/typography.ts`, `constants/spacing.ts`, `constants/motion.ts`.
Space Grotesk carries headings, Inter carries body copy, Bangers is reserved
for the occasional comic-accent moment (a connection made, a founding-
commuter reveal) — never a default heading face.

## Scripts

- `npm start` — Expo dev server
- `npm run typecheck` — `tsc --noEmit`
- `npm run seed` — populate a connected Supabase project with dev seed data (needs the service-role key — see docs/SUPABASE_SETUP.md)

## What's real vs. scaffolded

Real and working end-to-end once Supabase is configured: auth (Google, phone
OTP, email, Truecaller on Android, guest explore), session persistence,
password reset, account deletion, onboarding → commute + interests, discovery
(server-side relevance via Postgres functions, RLS-enforced), connections,
realtime chat, blocking, reporting, referral tracking, Dating Lobby opt-in.

Dashboard steps that cannot live in code (Google Cloud OAuth client, Supabase
redirect URLs, Truecaller SHA-1) are in `docs/SUPABASE_SETUP.md` and
`docs/TRUECALLER_SETUP.md`. Native binary changes (Truecaller, AdMob App IDs,
new native modules) need a new EAS build; JS-only work can ship over
[`docs/OTA.md`](docs/OTA.md).

**Android-only Truecaller one-tap sign-in** is fully wired and deployed —
button, client service, and a Supabase Edge Function doing real server-side
verification against Truecaller's actual API. Only a native build is left;
see [`docs/TRUECALLER_SETUP.md`](docs/TRUECALLER_SETUP.md). Note `patches/`
is applied automatically via `postinstall` — it fixes a real bug in the
Truecaller package's New Architecture support and must stay in place.

**AdMob** (banner ads, on Home + Discover) works out of the box in
development with Google's test IDs. Real IDs are a pure `.env` edit now, no
code changes — see [`docs/ADMOB_SETUP.md`](docs/ADMOB_SETUP.md). Needs a
native build either way, not Expo Go.
