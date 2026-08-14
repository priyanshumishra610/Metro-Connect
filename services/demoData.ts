/**
 * Realistic development-only seed data (brief §67) — used by the service
 * layer as a fallback when Supabase isn't configured, so the app is fully
 * navigable and honestly labeled as a demo instead of showing a blank or
 * broken screen. Never imported when HAS_SUPABASE_CONFIG is true, and never
 * written back to a real project.
 */
import type { DiscoverCommuterRow, Interest, Station } from '@/types/database';

export const DEMO_CITY = { id: 'demo-city', name: 'Delhi', country: 'India', timezone: 'Asia/Kolkata' };

export const DEMO_LINE = { id: 'demo-line-blue', name: 'Blue Line', color_hex: '#3B82F6' };

export const DEMO_STATIONS: Station[] = [
  { id: 'st-rajiv-chowk', city_id: DEMO_CITY.id, metro_system_id: 'demo-system', metro_line_id: DEMO_LINE.id, name: 'Rajiv Chowk', latitude: 28.6328, longitude: 77.2197, sequence_number: 1, is_active: true, created_at: '' },
  { id: 'st-dwarka', city_id: DEMO_CITY.id, metro_system_id: 'demo-system', metro_line_id: DEMO_LINE.id, name: 'Dwarka Sector 21', latitude: 28.5522, longitude: 77.0589, sequence_number: 2, is_active: true, created_at: '' },
  { id: 'st-noida', city_id: DEMO_CITY.id, metro_system_id: 'demo-system', metro_line_id: DEMO_LINE.id, name: 'Noida Sector 62', latitude: 28.6280, longitude: 77.3649, sequence_number: 3, is_active: true, created_at: '' },
  { id: 'st-huda', city_id: DEMO_CITY.id, metro_system_id: 'demo-system', metro_line_id: DEMO_LINE.id, name: 'HUDA City Centre', latitude: 28.4595, longitude: 77.0726, sequence_number: 4, is_active: true, created_at: '' },
];

export const DEMO_INTERESTS: Interest[] = [
  'AI', 'Startups', 'Design', 'Books', 'Fitness', 'Gaming', 'Music', 'Movies',
  'Photography', 'Travel', 'Business', 'Food', 'Sports', 'Art', 'Finance', 'Writing',
].map((label, i) => ({ id: `demo-interest-${i}`, slug: label.toLowerCase(), label, category: 'general', created_at: '' }));

export interface DemoPerson {
  id: string;
  displayName: string;
  profession: string;
  interests: string[];
  avatarSeed: string;
}

export const DEMO_PEOPLE: DemoPerson[] = [
  { id: 'demo-aarav', displayName: 'Aarav', profession: 'Software Developer', interests: ['AI', 'Startups', 'Fitness'], avatarSeed: 'Aarav' },
  { id: 'demo-meera', displayName: 'Meera', profession: 'Design Student', interests: ['Design', 'Books', 'Photography'], avatarSeed: 'Meera' },
  { id: 'demo-rohan', displayName: 'Rohan', profession: 'Startup Founder', interests: ['Startups', 'Business', 'Travel'], avatarSeed: 'Rohan' },
  { id: 'demo-ananya', displayName: 'Ananya', profession: 'Product Designer', interests: ['Design', 'Movies', 'Music'], avatarSeed: 'Ananya' },
  { id: 'demo-kabir', displayName: 'Kabir', profession: 'Consultant', interests: ['Finance', 'Fitness', 'Travel'], avatarSeed: 'Kabir' },
  { id: 'demo-sara', displayName: 'Sara', profession: 'Photographer', interests: ['Photography', 'Travel', 'Music'], avatarSeed: 'Sara' },
];

export function demoDiscoverRows(): DiscoverCommuterRow[] {
  return DEMO_PEOPLE.map((p, i) => ({
    user_id: p.id,
    display_name: p.displayName,
    avatar_url: null,
    profession: p.profession,
    bio: null,
    is_identity_verified: i % 2 === 0,
    is_commute_verified: true,
    home_station_id: 'st-rajiv-chowk',
    destination_station_id: 'st-dwarka',
    metro_line_id: DEMO_LINE.id,
    start_time: '08:10:00',
    same_line: true,
    same_home_station: i < 3,
    same_destination: i % 2 === 0,
    similar_time: true,
    shared_interest_count: (i % 3) + 1,
  }));
}
