export type InterestCategory =
  | 'technology'
  | 'lifestyle'
  | 'creative'
  | 'culture'
  | 'business';

export interface InterestDefinition {
  slug: string;
  label: string;
  category: InterestCategory;
  icon: keyof typeof import('@expo/vector-icons').Feather.glyphMap;
}

/** Seed interest catalog — mirrors the `interests` table (brief §20). */
export const interestCatalog: InterestDefinition[] = [
  { slug: 'ai', label: 'AI', category: 'technology', icon: 'cpu' },
  { slug: 'startups', label: 'Startups', category: 'business', icon: 'trending-up' },
  { slug: 'design', label: 'Design', category: 'creative', icon: 'pen-tool' },
  { slug: 'books', label: 'Books', category: 'culture', icon: 'book-open' },
  { slug: 'fitness', label: 'Fitness', category: 'lifestyle', icon: 'activity' },
  { slug: 'gaming', label: 'Gaming', category: 'culture', icon: 'monitor' },
  { slug: 'music', label: 'Music', category: 'culture', icon: 'music' },
  { slug: 'movies', label: 'Movies', category: 'culture', icon: 'film' },
  { slug: 'photography', label: 'Photography', category: 'creative', icon: 'camera' },
  { slug: 'travel', label: 'Travel', category: 'lifestyle', icon: 'map-pin' },
  { slug: 'business', label: 'Business', category: 'business', icon: 'briefcase' },
  { slug: 'food', label: 'Food', category: 'lifestyle', icon: 'coffee' },
  { slug: 'sports', label: 'Sports', category: 'lifestyle', icon: 'target' },
  { slug: 'art', label: 'Art', category: 'creative', icon: 'image' },
  { slug: 'finance', label: 'Finance', category: 'business', icon: 'dollar-sign' },
  { slug: 'writing', label: 'Writing', category: 'creative', icon: 'edit-3' },
];

export const professionOptions = [
  'Student',
  'Developer',
  'Designer',
  'Founder',
  'Marketing',
  'Finance',
  'Researcher',
  'Consultant',
  'Product',
  'Other',
] as const;
