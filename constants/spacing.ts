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

/** Depth carries an offset and a soft blur — never a zero-offset glow. */
export const shadow = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 6,
  },
  raised: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 3,
  },
  floating: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.34,
    shadowRadius: 28,
    elevation: 10,
  },
} as const;

export const hitSlop = { top: 10, bottom: 10, left: 10, right: 10 };

/** Minimum accessible touch target (44pt, iOS HIG / Apple design floor). */
export const minTouchTarget = 44;
