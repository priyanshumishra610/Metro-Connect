/**
 * Type system. Space Grotesk carries headings, Inter carries body copy,
 * Bangers is reserved for comic-accent moments only (brief §10) — never a
 * heading default. Tracking is size-specific per apple-design guidance:
 * negative on large display type, near-zero on body, slightly positive on
 * small caption text.
 */
export const fontFamily = {
  headingRegular: 'SpaceGrotesk_400Regular',
  headingMedium: 'SpaceGrotesk_500Medium',
  headingSemiBold: 'SpaceGrotesk_600SemiBold',
  headingBold: 'SpaceGrotesk_700Bold',
  bodyRegular: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
  comic: 'Bangers_400Regular',
} as const;

type TextStyleToken = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
};

export const type: Record<string, TextStyleToken> = {
  display: { fontFamily: fontFamily.headingBold, fontSize: 34, lineHeight: 39, letterSpacing: -0.6 },
  h1: { fontFamily: fontFamily.headingBold, fontSize: 27, lineHeight: 32, letterSpacing: -0.4 },
  h2: { fontFamily: fontFamily.headingSemiBold, fontSize: 22, lineHeight: 27, letterSpacing: -0.3 },
  h3: { fontFamily: fontFamily.headingSemiBold, fontSize: 18, lineHeight: 23, letterSpacing: -0.1 },
  bodyLarge: { fontFamily: fontFamily.bodyRegular, fontSize: 17, lineHeight: 24, letterSpacing: 0 },
  body: { fontFamily: fontFamily.bodyRegular, fontSize: 15, lineHeight: 21, letterSpacing: 0 },
  bodyMedium: { fontFamily: fontFamily.bodyMedium, fontSize: 15, lineHeight: 21, letterSpacing: 0 },
  bodySemiBold: { fontFamily: fontFamily.bodySemiBold, fontSize: 15, lineHeight: 21, letterSpacing: 0 },
  small: { fontFamily: fontFamily.bodyRegular, fontSize: 13, lineHeight: 18, letterSpacing: 0.05 },
  smallMedium: { fontFamily: fontFamily.bodyMedium, fontSize: 13, lineHeight: 18, letterSpacing: 0.05 },
  caption: { fontFamily: fontFamily.bodyMedium, fontSize: 11.5, lineHeight: 15, letterSpacing: 0.3 },
  label: { fontFamily: fontFamily.bodySemiBold, fontSize: 12, lineHeight: 15, letterSpacing: 0.4 },
  comicSmall: { fontFamily: fontFamily.comic, fontSize: 20, lineHeight: 22, letterSpacing: 0.4 },
  comicMedium: { fontFamily: fontFamily.comic, fontSize: 28, lineHeight: 30, letterSpacing: 0.5 },
  comicLarge: { fontFamily: fontFamily.comic, fontSize: 40, lineHeight: 42, letterSpacing: 0.5 },
};

export type TypeToken = keyof typeof type;
