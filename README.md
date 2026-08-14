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

Without a `.env`, the app boots straight into a **demo mode** — every screen
is fully navigable against realistic seed data (see the "Demo mode" banner),
so you can review onboarding, discovery, chat, and the rest before wiring up
a real backend. To connect a real Supabase project, follow
[`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md).

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

Real and working end-to-end once Supabase is configured: auth (email +
password, session persistence, password reset, account deletion), onboarding
→ commute + interests, discovery (server-side relevance via Postgres
functions, RLS-enforced), connections, realtime chat, blocking, reporting,
referral tracking, Dating Lobby opt-in.

Intentionally left as documented setup steps rather than invented (brief
§82): Google Sign-In needs a native OAuth client ID; final `auth.users`
deletion needs a service-role server endpoint; AdMob needs a native build
(not Expo Go) and, for production, real ad unit IDs. All three are called
out with exact next steps in `docs/SUPABASE_SETUP.md`.
