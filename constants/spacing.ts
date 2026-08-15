/** One 4px rhythm used everywhere — no ad hoc spacing values in screens. */
export const space = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

/**
 * Depth carries an offset and a soft blur — never a zero-offset glow. The
 * editorial ink-on-paper world (v3) leans on a crisp border for definition
 * first and shadow second — these are deliberately quieter than a typical
 * "card app" so flat paper sections don't read as floating tiles.
 */
export const shadow = {
  card: {
    shadowColor: '#17161A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  raised: {
    shadowColor: '#17161A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  floating: {
    shadowColor: '#17161A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
} as const;

export const hitSlop = { top: 10, bottom: 10, left: 10, right: 10 };

/** Bottom breathing room for scrollable tab-screen content — the flush in-flow tab bar already reserves its own space, this is just comfortable trailing padding. */
export const tabBarClearance = 32;

/** Minimum accessible touch target (44pt, iOS HIG / Apple design floor). */
export const minTouchTarget = 44;
