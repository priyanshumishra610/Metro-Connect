/**
 * Development seed data (brief §67–68). Never run against production.
 *
 * Requires two env vars this file reads directly from process.env — not the
 * EXPO_PUBLIC_ ones the app bundles, since this needs the service-role key
 * to bypass RLS for seeding and that key must never ship in the app:
 *
 *   SUPABASE_URL=...
 *   SUPABASE_SERVICE_ROLE_KEY=...   (Project Settings > API > service_role)
 *
 * Usage: put those two lines in a local .env (already gitignored), then:
 *   npm run seed
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (service-role, not anon) before running the seed script.');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

const INTERESTS = [
  'AI', 'Startups', 'Design', 'Books', 'Fitness', 'Gaming', 'Music', 'Movies',
  'Photography', 'Travel', 'Business', 'Food', 'Sports', 'Art', 'Finance', 'Writing',
];

const DEMO_USERS = [
  { email: 'aarav@metroconnect.demo', displayName: 'Aarav', profession: 'Software Developer', interests: ['AI', 'Startups', 'Fitness'] },
  { email: 'meera@metroconnect.demo', displayName: 'Meera', profession: 'Design Student', interests: ['Design', 'Books', 'Photography'] },
  { email: 'rohan@metroconnect.demo', displayName: 'Rohan', profession: 'Startup Founder', interests: ['Startups', 'Business', 'Travel'] },
  { email: 'ananya@metroconnect.demo', displayName: 'Ananya', profession: 'Product Designer', interests: ['Design', 'Movies', 'Music'] },
  { email: 'kabir@metroconnect.demo', displayName: 'Kabir', profession: 'Consultant', interests: ['Finance', 'Fitness', 'Travel'] },
  { email: 'sara@metroconnect.demo', displayName: 'Sara', profession: 'Photographer', interests: ['Photography', 'Travel', 'Music'] },
];

const STATIONS = [
  { name: 'Rajiv Chowk', sequence: 1 },
  { name: 'Dwarka Sector 21', sequence: 2 },
  { name: 'Noida Sector 62', sequence: 3 },
  { name: 'HUDA City Centre', sequence: 4 },
];

async function main() {
  console.log('Seeding city, metro system, line, stations...');

  const { data: city, error: cityError } = await admin
    .from('cities')
    .upsert({ name: 'Delhi', country: 'India', timezone: 'Asia/Kolkata' }, { onConflict: 'name' })
    .select()
    .single();
  if (cityError) throw cityError;

  const { data: system, error: systemError } = await admin
    .from('metro_systems')
    .upsert({ city_id: city.id, name: 'Delhi Metro' }, { onConflict: 'city_id,name' })
    .select()
    .single();
  if (systemError) throw systemError;

  const { data: line, error: lineError } = await admin
    .from('metro_lines')
    .upsert({ metro_system_id: system.id, name: 'Blue Line', color_hex: '#3B82F6' }, { onConflict: 'metro_system_id,name' })
    .select()
    .single();
  if (lineError) throw lineError;

  const stationIds: Record<string, string> = {};
  for (const station of STATIONS) {
    const { data, error } = await admin
      .from('stations')
      .upsert(
        {
          city_id: city.id,
          metro_system_id: system.id,
          metro_line_id: line.id,
          name: station.name,
          sequence_number: station.sequence,
        },
        { onConflict: 'city_id,metro_line_id,name' }
      )
      .select()
      .single();
    if (error) throw error;
    stationIds[station.name] = data.id;
  }

  console.log('Seeding interests...');
  const interestIds: Record<string, string> = {};
  for (const label of INTERESTS) {
    const { data, error } = await admin
      .from('interests')
      .upsert({ slug: label.toLowerCase(), label, category: 'general' }, { onConflict: 'slug' })
      .select()
      .single();
    if (error) throw error;
    interestIds[label] = data.id;
  }

  console.log('Seeding demo users...');
  for (const user of DEMO_USERS) {
    const { data: created, error: userError } = await admin.auth.admin.createUser({
      email: user.email,
      password: 'MetroConnectDemo123!',
      email_confirm: true,
    });
    if (userError && !userError.message.includes('already been registered')) throw userError;

    const userId =
      created?.user?.id ??
      (await admin.auth.admin.listUsers()).data.users.find((u) => u.email === user.email)?.id;
    if (!userId) continue;

    await admin
      .from('profiles')
      .update({
        display_name: user.displayName,
        username: user.displayName.toLowerCase(),
        profession: user.profession,
        city_id: city.id,
        is_profile_complete: true,
        is_commute_verified: true,
      })
      .eq('id', userId);

    await admin.from('commute_preferences').upsert(
      {
        user_id: userId,
        direction: 'outbound',
        home_station_id: stationIds['Rajiv Chowk'],
        destination_station_id: stationIds['Dwarka Sector 21'],
        metro_line_id: line.id,
        start_time: '08:10:00',
        end_time: '09:00:00',
        days_of_week: [1, 2, 3, 4, 5],
        frequency: 'weekdays',
        is_primary: true,
      },
      { onConflict: 'user_id,direction' }
    );

    await admin.from('user_interests').delete().eq('user_id', userId);
    await admin
      .from('user_interests')
      .insert(user.interests.map((label) => ({ user_id: userId, interest_id: interestIds[label] })));

    console.log(`  seeded ${user.displayName}`);
  }

  console.log('Done.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
