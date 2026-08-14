# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

<!-- Inferred: React Native/Expo, single codebase shipping to iOS and Android. Metro Connect
uses one original brand design system rather than switching visual language per OS (per the
brief's explicit "create an original Metro Connect design system... do not copy any existing
product"), but interaction conventions (gestures, haptics, navigation affordances) should still
respect each platform. Recorded as `adaptive` so both ios.md and android.md craft guidance apply. -->

## Stack

Expo (React Native) + TypeScript. Supabase (Postgres, Auth, Row Level Security, Storage,
Realtime) via `@supabase/supabase-js` as the sole backend. React Native Reanimated + Gesture
Handler for motion. Google AdMob via a centralized `AdManager` service (test IDs in
development, env-configured IDs in production). This stack is explicit in the brief, not
delegated.

## Users

Primary: daily metro/transit commuters in one launch city — students, young professionals,
developers, designers, founders, creators, consultants — who repeatedly see the same strangers
on their commute and have no way to turn that recognition into an actual connection. Includes
people new to a city and people who commute alone and want to expand their social circle.

Secondary, explicitly opt-in and separate from the core experience: users interested in dating
through a dedicated Dating Lobby.

The interface must read as mature enough for working professionals while staying playful enough
for students — not a children's app, not a corporate tool.

## Product Purpose

Metro Connect turns repeated real-world proximity (same station, same line, same time window,
same days) into meaningful human connections. The core loop: join → set commute → add interests
→ discover relevant people → connect → chat → see them again on the actual commute → build a
real relationship. Success is measured by connections made and sustained, not time-in-app —
the product is explicitly designed to help people connect and then get back to their lives, not
to maximize engagement.

## Positioning

Not a dating app, not LinkedIn, not "Tinder with a metro map," not a generic content-feed social
network. The mechanism a competitor can't casually copy: matching on *repeated* proximity
(routine — same route, recurring time window, recurring days) rather than *momentary* proximity
("who's nearby right now"), combined with shared interests. Primary positioning: "a social
network for your daily commute." Secondary: commute buddies, shared-interest discovery,
professional connections found naturally, friendship — with dating available only as an
explicitly opted-into, separate lobby.

## Operating Context

Mobile app, iOS + Android, single codebase. First launch targets one city, one metro network,
one or a few metro lines — but the backend schema is transit-system- and city-agnostic
(cities → metro_systems → metro_lines → stations) so it can expand to more lines, more cities,
and other transit modes (bus, suburban rail) later without a rearchitecture.

Distinct in-app modes: standard Home/Discover/Connections/Messages/Profile navigation; a
dedicated Commute Mode (active-journey state, no live location exposed); an opt-in Dating Lobby,
fully separate from default discovery; a Safety Center (verification status, block/report,
privacy controls, first-meeting safety guidance).

Monetization is Google AdMob only (not AdSense), routed through one centralized `AdManager`,
secondary to product and connection quality — never placed in onboarding, connection requests,
conversations, safety screens, or immediately post-auth.

## Capabilities and Constraints

- Auth is real Supabase Auth: email/password + Google Sign-In, password reset, session
  persistence, session expiration handling, account deletion. No secrets client-side.
- Discovery is always a bounded, filtered, paginated query — never a full user dump. Every
  discovery result must carry a plain-language relevance reason ("Same route," "3 shared
  interests") — never a fabricated precision score ("94.382% compatible").
- Location/commute privacy is structural, not a setting: the product stores and shows
  station-level + commute-time-window data only. Exact coordinates, live/precise location, and
  private commute history are never exposed to other users, even in Commute Mode.
  Home/destination stations are never shown as precise addresses.
  the top-level directive is "does this information actually need to be visible? If not, hide it."
- No endless feed, no follower/like counts, no public popularity ranking, no infinite scroll
  optimized for attention. Gamification stays lightweight (achievement badges only).
  Notifications must be value-bearing, never manipulative ("Someone on your route wants to
  connect," never "You're missing out!").
- Row Level Security is mandatory and is the actual enforcement boundary — frontend checks are
  never trusted alone.
- Verification labels (Profile Complete / Commute Verified / Identity Verified) must always
  accurately reflect what was actually verified; never displayed as fake/default-true.
  Referral links must carry attribution and be trackable end-to-end (sent → opened → signup →
  commute created → converted); this loop is treated as critical to solving cold start, along
  with a genuine (non-fake-scarcity) Founding Commuter program and an explicit "you're early,
  here's how to grow your route" cold-start state instead of a dead-looking empty app.
- Open/undecided, left for a later decision rather than invented: the specific first launch
  city and metro system (the brief intentionally keeps the transit map generic/original —
  "design a generic Metro Connect visual map system," no copyrighted metro branding without
  licensing). Real Supabase and AdMob production credentials are not available in this
  environment; the app must be built against documented env-var configuration
  (`EXPO_PUBLIC_SUPABASE_URL`, etc.) with a clearly-labeled development/mock-data fallback, and
  must never claim an integration is live when it is only scaffolded.

## Brand Commitments

Name: **Metro Connect**. Core brand line: "You don't need more strangers on the internet. You
need to notice the people already around you." Recurring taglines: "Same route. Different
story." / "Turn your daily commute into your daily network." / "Meet the people already riding
with you."

Voice: a smart, human friend — never corporate-robotic. ("Nice. You're officially on the
route." not "Profile updated successfully." / "Nobody from your commute yet." not "No matches
found.")

Visual language: an original, handcrafted-feeling Metro Connect design system — modern
graphic-novel / urban-comic energy crossed with a premium startup product and metro-signage /
editorial design discipline. Explicitly not childish or cartoonish, not a copy of any named
inspiration (Spider-Verse, Arc, Linear, Figma, Cuberto were named as conceptual references
only). Comic-book devices (speech bubbles, action words like "WHOOSH!," "ONE LESS STRANGER.,"
narration boxes, station-sign/ticket motifs) are used sparingly, for specific special moments,
not as the default UI language.

The user volunteered a binding palette and type system (recorded as-is, not to be expanded or
reinterpreted): background `#050816`, surface `#0B1020`, card `#111827`; accents blue `#3B82F6`,
cyan `#38BDF8`, yellow `#FACC15`, orange `#FB923C`, green `#22C55E`, pink `#EC4899`; white
`#F8FAFC`, muted `#94A3B8`, border `#1E293B`. Typography: Space Grotesk (headings), Inter
(body), a Bangers-style expressive display face reserved for comic accents only.

## Evidence on Hand

No real screenshots, testimonials, case studies, or press exist yet. Demo/seed personas
(e.g. Aarav — Software Developer; Meera — Design Student; Rohan — Startup Founder) are
brief-provided examples for realistic development seed data — never Lorem Ipsum, never mixed
into a production dataset.

## Product Principles

1. **Repeated proximity, not real-time proximity.** Match on routine (route, recurring time
   window, recurring days) — never on "who is near me right now."
2. **Privacy is structural, not a toggle.** Station- and time-window-level granularity only;
   RLS-enforced server-side; live/precise location is never sent to other users under any mode.
3. **Utility over attention-capture.** No infinite feed, no manipulative notifications, no
   popularity metrics — help people connect, then let them leave the app.
4. **Every match explains itself.** Relevance is always shown as a plain-language reason a user
   can verify against their own commute and interests, never as an opaque score.
5. **Safety and honesty are features.** Verification labels only ever mean what they claim;
   dating is opt-in and structurally separate; blocking/reporting/Safety Center are first-class,
   not an afterthought.

## Accessibility & Inclusion

Screen reader support, Dynamic Type/large-text scaling, high contrast, reduced-motion handling,
accessible touch target sizing, and never communicating state by color alone are explicit
product requirements, not aspirational.
