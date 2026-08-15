/**
 * Metro Connect color system — v3, an editorial ink-on-paper world:
 * black/white-and-warm-neutral dominant (~90% of any given screen, per the
 * craft principle this direction is built on), with exactly one saturated
 * accent doing the interactive work and a small family of muted, nature-
 * toned secondary hues reserved for meaning (verification, route/interest
 * tags, the Dating Lobby) rather than decoration. No color exists here
 * "because it's pretty" — every hue below has a job.
 */
export const palette = {
  ink: '#17161A',
  paper: '#FFFEFB',
  accent: '#2F5CFF',
} as const;

export const colors = {
  bg: '#FBF9F5',
  surface: '#FFFEFB',
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  border: 'rgba(23, 22, 26, 0.12)',
  borderStrong: 'rgba(23, 22, 26, 0.24)',

  textPrimary: '#17161A',
  textSecondary: '#6E6B66',
  textOnAccent: '#FFFEFB',

  // Interactive — one confident accent, not a rainbow.
  interactive: '#2F5CFF',
  interactivePressed: '#2444D1',
  focusRing: '#2F5CFF',

  // Status & meaning — muted, nature-toned, used sparingly and always with a label.
  success: '#2F6B4F',
  warning: '#9C5A1E',
  danger: '#B3261E',
  info: '#2B6B6B',

  // Product-specific accent roles
  routeMatch: '#2F5CFF', // commute/route relevance
  interestMatch: '#2B6B6B', // shared-interest relevance (muted teal)
  founding: '#8A5C12', // Founding Commuter / achievements (ochre)
  dating: '#6B3B5E', // Dating Lobby only — muted aubergine, never used in the core experience

  overlay: 'rgba(23, 22, 26, 0.55)',
  overlaySoft: 'rgba(23, 22, 26, 0.28)',
  hairline: 'rgba(23, 22, 26, 0.1)',
} as const;

export type ColorRole = keyof typeof colors;
