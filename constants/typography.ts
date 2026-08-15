/**
 * Type system v3 — an editorial two-family pairing: Fraunces (serif,
 * display/headlines) carries the voice, DM Sans (grotesque, body/UI)
 * carries function — chosen specifically to not be Inter, the de facto
 * default sans in most generated UI. Headlines run tight (~110% leading,
 * slightly negative tracking); body copy runs airy (~140% leading,
 * slightly positive tracking) — inverse rhythms are what make the pairing
 * read as considered rather than default. Bangers is still reserved for
 * comic-accent moments only — never a heading default.
 */
export const fontFamily = {
  displayRegular: 'Fraunces_500Medium',
  displaySemiBold: 'Fraunces_600SemiBold',
  displayBold: 'Fraunces_700Bold',
  displayItalic: 'Fraunces_500Medium_Italic',
  bodyRegular: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodySemiBold: 'DMSans_600SemiBold',
  bodyBold: 'DMSans_700Bold',
  bodyExtraBold: 'DMSans_800ExtraBold',
  comic: 'Bangers_400Regular',
} as const;

type TextStyleToken = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  textTransform?: 'none' | 'uppercase';
};

export const type: Record<string, TextStyleToken> = {
  display: { fontFamily: fontFamily.displayBold, fontSize: 40, lineHeight: 44, letterSpacing: -0.4 },
  h1: { fontFamily: fontFamily.displaySemiBold, fontSize: 32, lineHeight: 36, letterSpacing: -0.3 },
  h2: { fontFamily: fontFamily.displaySemiBold, fontSize: 24, lineHeight: 28, letterSpacing: -0.2 },
  h3: { fontFamily: fontFamily.displaySemiBold, fontSize: 19, lineHeight: 23, letterSpacing: -0.1 },
  displayItalicAccent: { fontFamily: fontFamily.displayItalic, fontSize: 20, lineHeight: 26, letterSpacing: 0 },

  bodyLarge: { fontFamily: fontFamily.bodyRegular, fontSize: 17, lineHeight: 24, letterSpacing: 0.1 },
  body: { fontFamily: fontFamily.bodyRegular, fontSize: 15, lineHeight: 21, letterSpacing: 0.1 },
  bodyMedium: { fontFamily: fontFamily.bodyMedium, fontSize: 15, lineHeight: 21, letterSpacing: 0.1 },
  bodySemiBold: { fontFamily: fontFamily.bodySemiBold, fontSize: 15, lineHeight: 21, letterSpacing: 0.05 },
  small: { fontFamily: fontFamily.bodyRegular, fontSize: 13, lineHeight: 18, letterSpacing: 0.15 },
  smallMedium: { fontFamily: fontFamily.bodyMedium, fontSize: 13, lineHeight: 18, letterSpacing: 0.15 },
  caption: { fontFamily: fontFamily.bodyMedium, fontSize: 11.5, lineHeight: 15, letterSpacing: 0.3 },
  label: { fontFamily: fontFamily.bodyBold, fontSize: 11, lineHeight: 13, letterSpacing: 1.2, textTransform: 'uppercase' },

  /** Bold, tracked, all-caps — the "directness" convention for primary CTAs. */
  cta: { fontFamily: fontFamily.bodyExtraBold, fontSize: 14, lineHeight: 17, letterSpacing: 0.8, textTransform: 'uppercase' },
  ctaSmall: { fontFamily: fontFamily.bodyExtraBold, fontSize: 12, lineHeight: 15, letterSpacing: 0.6, textTransform: 'uppercase' },

  comicSmall: { fontFamily: fontFamily.comic, fontSize: 20, lineHeight: 22, letterSpacing: 0.4 },
  comicMedium: { fontFamily: fontFamily.comic, fontSize: 28, lineHeight: 30, letterSpacing: 0.5 },
  comicLarge: { fontFamily: fontFamily.comic, fontSize: 40, lineHeight: 42, letterSpacing: 0.5 },
};

export type TypeToken = keyof typeof type;
