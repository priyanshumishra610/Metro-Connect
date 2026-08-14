# Design

<!-- impeccable:design-schema 1 -->

## Platform

adaptive (React Native / Expo — see PRODUCT.md)

## World

Modern graphic-novel energy crossed with metro signage and editorial
discipline, on a premium dark canvas — not a children's comic app, not a
generic AI-dark-mode-with-one-neon-accent template. The palette and type
system were volunteered as a binding brand commitment in the original brief
(recorded in PRODUCT.md) rather than selected through the open-ended
direction process — this file records how that pinned system actually
shipped in code, per `constants/colors.ts`, `constants/typography.ts`,
`constants/spacing.ts`, `constants/motion.ts`.

**Process note:** this build ran without the browser-based direction-picker
ceremony (`concept-seed.mjs` / `serve-question.mjs`) — those tools render an
HTML decision page in a system browser, which doesn't apply to a native
Expo/React Native codebase with no dev server to preview against in this
environment. The world itself was not invented; it was pinned. What DESIGN.md
records here is the committed token system and component vocabulary as
actually built, which is the finish-time job this file is meant to do
regardless of how the direction was reached.

## Color

Strategy: **Restrained-to-Committed** — a near-black operating surface
(`#050816` background / `#0B1020` surface / `#111827` card) carries almost
every screen, with one saturated accent (`interactive` blue `#3B82F6`) doing
the interactive work. The wider palette (cyan, yellow, orange, green, pink)
is role-locked, not decorative: cyan = shared-interest relevance, blue =
route relevance, yellow = Founding Commuter / achievement, green = verified
status, pink = Dating Lobby *only* (never leaks into the core experience —
this is a structural signal that dating is a separate space, not a UI
accident). See `constants/colors.ts` for the full semantic-role table.

Scene that forced dark: a commuter checking their phone on a crowded train,
often at low-light hours (early morning, evening) — a bright UI would be
both the wrong ambiance and a glare problem in that exact context.

## Type

Space Grotesk (headings) / Inter (body) / Bangers (comic accent only —
never a default heading face; used in exactly one component,
`ComicLabel`, gated to specific moments: a connection accepted, the
"Let's fix that" onboarding turn). All three are self-hosted via
`@expo-google-fonts/*` packages (real font files bundled with the app, not a
system-font fallback standing in for a display face). Tracking is
size-specific per token — negative on `display`/`h1`, near-zero on body,
slightly positive on `caption`/`label` — see `constants/typography.ts`.

## Materials & motion

Cards are solid (`colors.card`/`cardElevated`) with a real offset+blur
shadow (`constants/spacing.ts` → `shadow.card`/`raised`/`floating`) — no
zero-offset glow, no glass/blur used as decoration. Reanimated springs
follow the apple-design damping/response model: `springs.settle`
(critically damped, default for anything that just appears) vs.
`springs.momentum` (under-damped, reserved for gestures that already carry
velocity — button press, comic-label pop after a match). `ComicLabel` and
onboarding transitions respect `prefers-reduced-motion` via
`AccessibilityInfo.isReduceMotionEnabled()`.

## Component vocabulary

Icons are Feather (via `@expo/vector-icons`) throughout — one consistent
stroke family, never emoji standing in for iconography. The signature visual
is `components/metro/MetroRouteVisual.tsx`, an original SVG route diagram
(animated train, pulsing stations) — deliberately generic, never a real
transit authority's map or wordmark, per brief §47. Onboarding's crowded-car
illustration (`CommuterCrowdIllustration.tsx`) is a second authored SVG
asset rather than a stock photo or placeholder icon grid.

Primitives live in `components/ui/`: `Text` (the only text component —
every string sits on the type scale, no ad hoc `fontSize`), `Button`
(press-in scale spring + haptic, four variants), `Card`, `Chip` (interests,
route legs, relevance reasons — one pill vocabulary reused everywhere),
`Avatar` (deterministic color ring + initials fallback since there are no
real user photos yet), `VerificationBadge` (only ever renders from a real
boolean — see PRODUCT.md's honesty principle), `EmptyState` (product-voice
copy, never "No data found"), `ComicLabel` (the one Bangers moment).

## Known gaps / next pass

- App icon, splash image, and Android adaptive-icon layers are still the
  Expo template placeholders — need real Metro Connect brand assets before
  a store submission.
- No real user photography exists yet, so every avatar in both demo data
  and a freshly seeded backend renders through the initials/color-ring
  fallback rather than a photo.
