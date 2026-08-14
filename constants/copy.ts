/**
 * Product voice. Metro Connect talks like a smart friend, never a system
 * (brief §76) — comic-book lines (brief §49) are reserved for genuinely
 * special moments, not everyday chrome. Keep additions in this file so the
 * voice stays consistent instead of drifting screen to screen.
 */
export const comic = {
  connectionMade: 'ONE LESS STRANGER.',
  connectionUnlocked: 'CONNECTION UNLOCKED.',
  whoosh: 'WHOOSH!',
  sameRoute: 'SAME ROUTE.',
  differentStory: 'DIFFERENT STORY.',
  looksFamiliar: 'LOOKS FAMILIAR?',
  nextStop: 'NEXT STOP: NEW PEOPLE.',
  goSayHello: 'GO SAY HELLO.',
  plotTwist: 'PLOT TWIST.',
  crossedPaths: "YOU'VE CROSSED PATHS BEFORE.",
} as const;

export const voice = {
  connectionAccepted: (name: string) => `It's a connection. ${name} is officially on your route.`,
  connectionRequestSent: 'Sent. Fingers crossed they ride the same train.',
  profileSaved: "Nice. You're officially on the route.",
  commuteSaved: 'Your commute is set. Let’s see who’s already riding with you.',
  emptyDiscoveryTitle: (window: string) => `Nobody from your ${window} commute yet.`,
  emptyDiscoveryBody: 'Give your route some time — or invite a few people who take it with you.',
  emptyConnectionsTitle: 'Your future commute crew might be joining soon.',
  emptyMessagesTitle: 'No conversations yet.',
  emptyMessagesBody: 'Connect with someone on your route and start with an icebreaker.',
  coldStartTitle: "You're early.",
  coldStartBody: 'We’re building your route. Invite a few people who take the same metro to speed it up.',
  genericError: 'Something went wrong. Try again in a moment.',
  offline: "You're offline. Some things won't update until you're back.",
  networkTimeout: 'That took too long. Check your connection and try again.',
  unauthorized: 'Your session expired. Sign in again to continue.',
  rateLimited: "You're doing that a bit too fast. Give it a minute.",
} as const;

export const icebreakers = [
  'Which station do you usually board from?',
  'Coffee before work or after?',
  'How do you survive the morning commute?',
  "What's on your playlist lately?",
  'Seen anything good lately?',
] as const;

export const relevanceReasons = {
  sameLine: 'Same metro line',
  sameHomeStation: 'Same home station',
  sameDestination: 'Same destination',
  highRouteOverlap: 'High route overlap',
  similarTime: 'Similar commute time',
  similarDays: 'Similar commute days',
  sharedInterests: (count: number) => `${count} shared interest${count === 1 ? '' : 's'}`,
  sameCity: 'Same city',
  verified: 'Commute verified',
} as const;
