import type { WithSpringConfig } from 'react-native-reanimated';

/**
 * Spring presets translating apple-design's damping-ratio/response model into
 * Reanimated's damping/stiffness/mass. `settle` is critically damped (no
 * overshoot) and is the default for anything that just appears. `momentum`
 * is under-damped and reserved for gestures that already carried velocity
 * (a card swipe release, a sheet flick) — never for a menu that just faded in.
 */
export const springs: Record<string, WithSpringConfig> = {
  settle: { damping: 26, stiffness: 260, mass: 1 },
  momentum: { damping: 15, stiffness: 180, mass: 1 },
  sheet: { damping: 22, stiffness: 220, mass: 1 },
  press: { damping: 18, stiffness: 400, mass: 0.6 },
};

export const duration = {
  instant: 100,
  fast: 160,
  base: 220,
  slow: 320,
  reducedMotion: 180,
};

export const pressScale = 0.96;
