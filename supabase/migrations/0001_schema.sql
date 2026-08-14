-- Metro Connect — core schema
-- Run in order against a Supabase project: 0001_schema.sql, 0002_functions.sql,
-- 0003_rls.sql. See docs/SUPABASE_SETUP.md for how to apply these.

create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────────
-- Transit hierarchy — city/system/line/station agnostic so a second city or
-- transit mode is a new row, never a schema change (brief §6, §16, §19).
-- ─────────────────────────────────────────────────────────────────────────

create table cities (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  country text not null,
  timezone text not null default 'UTC',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table metro_systems (
  id uuid primary key default uuid_generate_v4(),
  city_id uuid not null references cities(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (city_id, name)
);

create table metro_lines (
  id uuid primary key default uuid_generate_v4(),
  metro_system_id uuid not null references metro_systems(id) on delete cascade,
  name text not null,
  color_hex text not null default '#3B82F6',
  created_at timestamptz not null default now(),
  unique (metro_system_id, name)
);

create table stations (
  id uuid primary key default uuid_generate_v4(),
  city_id uuid not null references cities(id) on delete cascade,
  metro_system_id uuid not null references metro_systems(id) on delete cascade,
  metro_line_id uuid not null references metro_lines(id) on delete cascade,
  name text not null,
  latitude double precision,
  longitude double precision,
  sequence_number integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (city_id, metro_line_id, name)
);

-- ─────────────────────────────────────────────────────────────────────────
-- Identity
-- ─────────────────────────────────────────────────────────────────────────

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  bio text check (char_length(bio) <= 280),
  profession text,
  education text,
  city_id uuid references cities(id),
  is_profile_complete boolean not null default false,
  is_identity_verified boolean not null default false,
  is_commute_verified boolean not null default false,
  is_dating_opted_in boolean not null default false,
  founding_commuter_number integer unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create type commute_frequency as enum ('weekdays', 'three_to_four_days', 'few_days', 'occasionally');
create type commute_direction as enum ('outbound', 'return');

create table commute_preferences (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  direction commute_direction not null default 'outbound',
  home_station_id uuid not null references stations(id),
  destination_station_id uuid not null references stations(id),
  metro_line_id uuid not null references metro_lines(id),
  start_time time not null,
  end_time time not null,
  days_of_week smallint[] not null default '{1,2,3,4,5}', -- 0=Sun .. 6=Sat
  frequency commute_frequency not null default 'weekdays',
  is_primary boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint commute_route_differs check (home_station_id <> destination_station_id),
  constraint commute_unique_direction unique (user_id, direction)
);

create table interests (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  label text not null,
  category text not null,
  created_at timestamptz not null default now()
);

create table user_interests (
  user_id uuid not null references profiles(id) on delete cascade,
  interest_id uuid not null references interests(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, interest_id)
);

-- ─────────────────────────────────────────────────────────────────────────
-- Social graph
-- ─────────────────────────────────────────────────────────────────────────

create type connection_status as enum ('pending', 'accepted', 'declined');

create table connections (
  id uuid primary key default uuid_generate_v4(),
  requester_id uuid not null references profiles(id) on delete cascade,
  addressee_id uuid not null references profiles(id) on delete cascade,
  status connection_status not null default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  constraint connections_distinct_users check (requester_id <> addressee_id),
  constraint connections_unique_pair unique (requester_id, addressee_id)
);

create table conversations (
  id uuid primary key default uuid_generate_v4(),
  connection_id uuid references connections(id) on delete set null,
  created_at timestamptz not null default now()
);

create table conversation_members (
  conversation_id uuid not null references conversations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  last_read_at timestamptz,
  primary key (conversation_id, user_id)
);

create table messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create type notification_type as enum (
  'connection_request', 'connection_accepted', 'new_message',
  'commute_update', 'community_activity', 'referral'
);

create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  type notification_type not null,
  title text not null,
  body text not null,
  data jsonb not null default '{}',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- Safety
-- ─────────────────────────────────────────────────────────────────────────

create table blocks (
  id uuid primary key default uuid_generate_v4(),
  blocker_id uuid not null references profiles(id) on delete cascade,
  blocked_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint blocks_distinct_users check (blocker_id <> blocked_id),
  constraint blocks_unique_pair unique (blocker_id, blocked_id)
);

create type report_category as enum (
  'harassment', 'spam', 'fake_profile', 'inappropriate_content', 'safety_concern', 'other'
);
create type report_context as enum ('profile', 'chat', 'connection', 'dating_lobby');
create type report_status as enum ('open', 'reviewed', 'actioned', 'dismissed');

create table reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid not null references profiles(id) on delete cascade,
  reported_user_id uuid references profiles(id) on delete cascade,
  context report_context not null,
  category report_category not null,
  details text check (char_length(details) <= 1000),
  conversation_id uuid references conversations(id) on delete set null,
  status report_status not null default 'open',
  created_at timestamptz not null default now()
);

create type verification_type as enum ('profile_complete', 'commute_verified', 'identity_verified');
create type verification_status as enum ('pending', 'verified', 'rejected');

create table verification (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  type verification_type not null,
  status verification_status not null default 'pending',
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, type)
);

-- ─────────────────────────────────────────────────────────────────────────
-- Dating Lobby — strictly opt-in, structurally separate from core discovery.
-- ─────────────────────────────────────────────────────────────────────────

create table dating_preferences (
  user_id uuid primary key references profiles(id) on delete cascade,
  is_opted_in boolean not null default false,
  show_in_lobby boolean not null default true,
  show_commute_time boolean not null default true,
  interested_in text[] not null default '{}',
  min_age smallint,
  max_age smallint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- Interest circles
-- ─────────────────────────────────────────────────────────────────────────

create table communities (
  id uuid primary key default uuid_generate_v4(),
  interest_id uuid references interests(id) on delete cascade,
  city_id uuid references cities(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  unique (interest_id, city_id)
);

create table community_members (
  community_id uuid not null references communities(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (community_id, user_id)
);

-- ─────────────────────────────────────────────────────────────────────────
-- Growth loop
-- ─────────────────────────────────────────────────────────────────────────

create table referrals (
  id uuid primary key default uuid_generate_v4(),
  referrer_id uuid not null references profiles(id) on delete cascade,
  code text unique not null,
  created_at timestamptz not null default now()
);

create type referral_event_type as enum (
  'sent', 'opened', 'signup_completed', 'commute_created', 'converted'
);

create table referral_events (
  id uuid primary key default uuid_generate_v4(),
  referral_id uuid not null references referrals(id) on delete cascade,
  event_type referral_event_type not null,
  referred_user_id uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- Indexes (brief §65) — every foreign key and hot filter used by discovery.
-- ─────────────────────────────────────────────────────────────────────────

create index idx_metro_systems_city on metro_systems(city_id);
create index idx_metro_lines_system on metro_lines(metro_system_id);
create index idx_stations_city on stations(city_id);
create index idx_stations_line on stations(metro_line_id);

create index idx_profiles_city on profiles(city_id);

create index idx_commute_user on commute_preferences(user_id);
create index idx_commute_home_station on commute_preferences(home_station_id);
create index idx_commute_destination_station on commute_preferences(destination_station_id);
create index idx_commute_line on commute_preferences(metro_line_id);

create index idx_user_interests_interest on user_interests(interest_id);

create index idx_connections_requester on connections(requester_id);
create index idx_connections_addressee on connections(addressee_id);
create index idx_connections_status on connections(status);

create index idx_conversation_members_user on conversation_members(user_id);
create index idx_messages_conversation_created on messages(conversation_id, created_at);

create index idx_notifications_user_created on notifications(user_id, created_at desc);
create index idx_notifications_user_unread on notifications(user_id) where is_read = false;

create index idx_blocks_blocker on blocks(blocker_id);
create index idx_blocks_blocked on blocks(blocked_id);

create index idx_reports_reported_user on reports(reported_user_id);
create index idx_reports_status on reports(status);

create index idx_community_members_user on community_members(user_id);

create index idx_referrals_referrer on referrals(referrer_id);
create index idx_referral_events_referral on referral_events(referral_id);
create index idx_referral_events_type on referral_events(event_type);
