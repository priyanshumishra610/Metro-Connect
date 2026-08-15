# Design

<!-- impeccable:design-schema 1 -->

## Platform

adaptive (React Native / Expo — see PRODUCT.md)

## World — v3 (redesign, supersedes v2's glassmorphism)

The user pointed at a reference (a Hinge brand-guidelines page) and asked
for a "huge update." That page is a real product's trademarked brand
system — its mascot, wordmark, and exact brand colors aren't Metro
Connect's to use, and the original brief explicitly rules out copying any
named product. What's genuinely reusable is the **craft technique**, which
isn't proprietary: a black/white-dominant palette with color used only
where it means something, a serif-display + grotesque-UI type pairing with
inverse leading rhythms (tight headlines, airy body), bold all-caps direct
CTAs, and flat modular restraint over decoration. That's what shipped here,
executed with Metro Connect's own accent color, its own metro/illustration
motifs, and no mascot.

This directly supersedes v2: full glassmorphism and "black/white dominant,
color reserved for meaning" cannot coexist, so every `BlurView` was removed
from the primitive layer (`Card`, `Button`, `Chip`, `TextField`, the tab
bar) in favor of flat surfaces defined by a crisp border. The
colorful `AmbientBackground` glow blobs are gone entirely — a flat paper
background is the point now, not something to compete with.

## Color

Strategy: **Restrained** — ink (`#17161A`) and warm paper (`#FBF9F5`/
`#FFFEFB`/`#FFFFFF`) cover the large majority of any screen. Exactly one
saturated accent (`#2F5CFF`, a confident indigo-blue) carries interactive
meaning — links, selected states, the metro-route visual, route-relevance
tags — and is deliberately *never* used as a button fill, so it keeps
reading as "this is meaningful" rather than becoming wallpaper. A small
family of muted, nature-toned secondary hues (deep forest green for
verified, muted teal for shared interests, ochre for Founding Commuter,
muted aubergine for the Dating Lobby, brick red for danger) exists purely
for semantic tagging, never decoration — see `constants/colors.ts`.

Primary/destructive buttons are solid **ink** or **danger**, not the accent
— a deliberate choice: Hinge's own CTAs are black, not colored, and
reserving the accent for data/relevance keeps two visual languages (action
vs. meaning) distinct instead of collapsing into "everything is blue."

## Type

Two families, inverse rhythms:
- **Fraunces** (serif) carries headlines — 500/600/700 weight, tight
  leading (~110%), slightly negative tracking. An italic cut
  (`displayItalicAccent`) is available for editorial flourishes.
- **DM Sans** (grotesque) carries everything functional — body copy at
  ~140% leading with light positive tracking for readability, and a
  dedicated `cta`/`ctaSmall` token (ExtraBold, uppercase, tracked) for the
  "speaking plainly" button/label convention. Chosen specifically to not be
  Inter, which the user asked to drop — Inter is the de facto default sans
  in most generated UI, and this pairing works better without it anyway:
  DM Sans reads warmer alongside Fraunces than Inter's more neutral,
  technical character did.
- **Bangers** is unchanged from v1/v2 — comic-accent moments only, gated to
  `ComicLabel`, never a heading default.

## Materials & motion

Flat, bordered, precise. `shadow.*` (`constants/spacing.ts`) is now
deliberately quiet — a 1-2px offset at low opacity — because the border
does the definition work, not elevation. The tab bar is a normal in-flow
bar with a crisp top border, not a floating blurred pill. Motion additions
from v2 (staggered list entrances, tab-icon spring, button press
scale+opacity, the connect-success `ZoomIn` badge) carry forward unchanged
— none of that was glass-specific.

## Component vocabulary

Feather icons, the original SVG metro-route visual and onboarding crowd
illustration — both re-toned from a multi-color accent set down to
ink + the single accent, matching the restrained palette. `Text` remains
the only text component. `Avatar`'s fallback ring now cycles through the
muted semantic colors (`interactive`, `interestMatch`, `founding`,
`success`, `dating`, `danger`) instead of the old vivid rainbow — variety
without breaking the 90% ink/paper rule.

## Known gaps / next pass

- App icon, splash image, and Android adaptive-icon layers are still Expo
  template placeholders (background color now matches the paper tone, but
  the artwork itself needs real Metro Connect branding).
- No real user photography yet — every avatar still renders through the
  initials/color-ring fallback.
- This is the third visual direction in one session (dark comic → light
  glass → editorial ink/paper). If this one lands, it's worth resisting
  further full-system swings in favor of refining within it.
