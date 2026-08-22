/**
 * Isolated guest/demo dataset. Used when the user is in Guest mode or
 * Supabase is not configured. Never queried from production, and never
 * written back to a real project. Conversion to a real account must not
 * copy these rows into the signed-in user's data.
 */
import type { Community, DiscoverCommuterRow, Interest, Profile, Station } from '@/types/database';

export const GUEST_PROFILE_ID = 'guest-local';

export const DEMO_CITY = { id: 'demo-city', name: 'Delhi', country: 'India', timezone: 'Asia/Kolkata' };

export const DEMO_LINE = { id: 'demo-line-blue', name: 'Blue Line', color_hex: '#3B82F6' };

export const DEMO_STATIONS: Station[] = [
  { id: 'st-rajiv-chowk', city_id: DEMO_CITY.id, metro_system_id: 'demo-system', metro_line_id: DEMO_LINE.id, name: 'Rajiv Chowk', latitude: 28.6328, longitude: 77.2197, sequence_number: 1, is_active: true, interchange_group: null, created_at: '' },
  { id: 'st-dwarka', city_id: DEMO_CITY.id, metro_system_id: 'demo-system', metro_line_id: DEMO_LINE.id, name: 'Dwarka Sector 21', latitude: 28.5522, longitude: 77.0589, sequence_number: 2, is_active: true, interchange_group: null, created_at: '' },
  { id: 'st-noida', city_id: DEMO_CITY.id, metro_system_id: 'demo-system', metro_line_id: DEMO_LINE.id, name: 'Noida Sector 62', latitude: 28.6280, longitude: 77.3649, sequence_number: 3, is_active: true, interchange_group: null, created_at: '' },
  { id: 'st-huda', city_id: DEMO_CITY.id, metro_system_id: 'demo-system', metro_line_id: DEMO_LINE.id, name: 'HUDA City Centre', latitude: 28.4595, longitude: 77.0726, sequence_number: 4, is_active: true, interchange_group: null, created_at: '' },
];

export const DEMO_INTERESTS: Interest[] = [
  'AI', 'Startups', 'Design', 'Books', 'Fitness', 'Gaming', 'Music', 'Movies',
  'Photography', 'Travel', 'Business', 'Food', 'Sports', 'Art', 'Finance', 'Writing',
].map((label, i) => ({ id: `demo-interest-${i}`, slug: label.toLowerCase(), label, category: 'general', created_at: '' }));

export interface DemoPerson {
  id: string;
  displayName: string;
  profession: string;
  education: string | null;
  bio: string;
  interests: string[];
  avatarSeed: string;
  homeStationId: string;
  destinationStationId: string;
  startTime: string;
}

export const DEMO_PEOPLE: DemoPerson[] = [
  {
    id: 'demo-aarav',
    displayName: 'Aarav',
    profession: 'Software Developer',
    education: 'IIT Delhi',
    bio: 'Builds things on the morning Blue Line. Always has a podcast queued.',
    interests: ['AI', 'Startups', 'Fitness'],
    avatarSeed: 'Aarav',
    homeStationId: 'st-rajiv-chowk',
    destinationStationId: 'st-dwarka',
    startTime: '08:10:00',
  },
  {
    id: 'demo-meera',
    displayName: 'Meera',
    profession: 'Design Student',
    education: 'NID',
    bio: 'Sketching between stations. Looking for people who notice type on metro maps.',
    interests: ['Design', 'Books', 'Photography'],
    avatarSeed: 'Meera',
    homeStationId: 'st-rajiv-chowk',
    destinationStationId: 'st-dwarka',
    startTime: '08:20:00',
  },
  {
    id: 'demo-rohan',
    displayName: 'Rohan',
    profession: 'Startup Founder',
    education: null,
    bio: 'Takes the same train every weekday. Happy to talk shops, not pitches.',
    interests: ['Startups', 'Business', 'Travel'],
    avatarSeed: 'Rohan',
    homeStationId: 'st-rajiv-chowk',
    destinationStationId: 'st-noida',
    startTime: '08:05:00',
  },
  {
    id: 'demo-ananya',
    displayName: 'Ananya',
    profession: 'Product Designer',
    education: 'NIFT',
    bio: 'Headphones on, notebook out. Same car, different chapter.',
    interests: ['Design', 'Movies', 'Music'],
    avatarSeed: 'Ananya',
    homeStationId: 'st-dwarka',
    destinationStationId: 'st-rajiv-chowk',
    startTime: '08:15:00',
  },
  {
    id: 'demo-kabir',
    displayName: 'Kabir',
    profession: 'Consultant',
    education: 'SRCC',
    bio: 'Weekday regular. Will trade commute hacks for coffee recs near the station.',
    interests: ['Finance', 'Fitness', 'Travel'],
    avatarSeed: 'Kabir',
    homeStationId: 'st-huda',
    destinationStationId: 'st-rajiv-chowk',
    startTime: '08:00:00',
  },
  {
    id: 'demo-sara',
    displayName: 'Sara',
    profession: 'Photographer',
    education: 'Jamia',
    bio: 'Shoots the city from the platform. Looking for fellow early riders.',
    interests: ['Photography', 'Travel', 'Music'],
    avatarSeed: 'Sara',
    homeStationId: 'st-rajiv-chowk',
    destinationStationId: 'st-huda',
    startTime: '08:25:00',
  },
];

export const DEMO_CIRCLES: Array<Community & { member_count: number }> = [
  {
    id: 'demo-circle-ai',
    interest_id: 'demo-interest-0',
    city_id: DEMO_CITY.id,
    name: 'AI on the Blue Line',
    description: 'Commuters who talk models, not just meetings.',
    created_at: '',
    member_count: 18,
  },
  {
    id: 'demo-circle-design',
    interest_id: 'demo-interest-2',
    city_id: DEMO_CITY.id,
    name: 'Design between stations',
    description: 'Sketchbooks, type, and the quiet car.',
    created_at: '',
    member_count: 12,
  },
  {
    id: 'demo-circle-startups',
    interest_id: 'demo-interest-1',
    city_id: DEMO_CITY.id,
    name: 'Builders on the route',
    description: 'Founders and operators who share a platform, not a Slack.',
    created_at: '',
    member_count: 9,
  },
];

export function createGuestProfile(): Profile {
  return {
    id: GUEST_PROFILE_ID,
    username: 'guest',
    display_name: 'Guest',
    avatar_url: null,
    bio: null,
    profession: null,
    education: null,
    city_id: DEMO_CITY.id,
    is_profile_complete: true,
    is_identity_verified: false,
    is_commute_verified: false,
    is_dating_opted_in: false,
    founding_commuter_number: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function isDemoPersonId(id: string): boolean {
  return id.startsWith('demo-') || id === GUEST_PROFILE_ID;
}

export function demoPersonToProfile(person: DemoPerson): Profile {
  return {
    id: person.id,
    username: person.displayName.toLowerCase(),
    display_name: person.displayName,
    avatar_url: null,
    bio: person.bio,
    profession: person.profession,
    education: person.education || null,
    city_id: DEMO_CITY.id,
    is_profile_complete: true,
    is_identity_verified: person.id === 'demo-aarav' || person.id === 'demo-ananya',
    is_commute_verified: true,
    is_dating_opted_in: false,
    founding_commuter_number: null,
    created_at: '',
    updated_at: '',
  };
}

export function getDemoPerson(id: string): DemoPerson | undefined {
  return DEMO_PEOPLE.find((p) => p.id === id);
}

export function demoDiscoverRows(): DiscoverCommuterRow[] {
  return DEMO_PEOPLE.map((p, i) => ({
    user_id: p.id,
    display_name: p.displayName,
    avatar_url: null,
    profession: p.profession,
    bio: p.bio,
    is_identity_verified: i % 2 === 0,
    is_commute_verified: true,
    home_station_id: p.homeStationId,
    destination_station_id: p.destinationStationId,
    metro_line_id: DEMO_LINE.id,
    start_time: p.startTime,
    same_line: true,
    same_home_station: i < 3,
    same_destination: i % 2 === 0,
    same_interchange: false,
    similar_time: true,
    shared_interest_count: (i % 3) + 1,
  }));
}

export function stationName(id: string): string {
  return DEMO_STATIONS.find((s) => s.id === id)?.name ?? 'Station';
}
