/**
 * Metro Connect color system.
 * Background/surface/accent values are pinned by the product brief — do not
 * reinterpret them. `danger` is the one derived addition (Tailwind red-500),
 * chosen to sit in the same numeric family as the pinned accents.
 */
export const palette = {
  background: '#050816',
  surface: '#0B1020',
  card: '#111827',
  border: '#1E293B',

  blue: '#3B82F6',
  cyan: '#38BDF8',
  yellow: '#FACC15',
  orange: '#FB923C',
  green: '#22C55E',
  pink: '#EC4899',
  red: '#EF4444',

  white: '#F8FAFC',
  muted: '#94A3B8',
  black: '#020409',
} as const;

/**
 * Semantic roles. Screens should reach for these, not raw palette values —
 * it keeps color intentional rather than decorative (brief §9).
 */
export const colors = {
  bg: palette.background,
  surface: palette.surface,
  card: palette.card,
  cardElevated: '#161F32',
  border: palette.border,
  borderStrong: '#2A3A55',

  textPrimary: palette.white,
  textSecondary: palette.muted,
  textOnAccent: palette.white,
  textInverse: palette.black,

  // Interactive / structural
  interactive: palette.blue,
  interactivePressed: '#2563EB',
  focusRing: palette.cyan,

  // Status & meaning — used sparingly and always with a label, never color alone
  success: palette.green,
  warning: palette.orange,
  danger: palette.red,
  info: palette.cyan,

  // Product-specific accent roles
  routeMatch: palette.blue, // commute/route relevance
  interestMatch: palette.cyan, // shared-interest relevance
  founding: palette.yellow, // Founding Commuter / achievements
  dating: palette.pink, // Dating Lobby only — never used in the core experience

  overlay: 'rgba(2, 4, 9, 0.72)',
  overlaySoft: 'rgba(2, 4, 9, 0.4)',
  hairline: 'rgba(248, 250, 252, 0.08)',
} as const;

export type ColorRole = keyof typeof colors;
