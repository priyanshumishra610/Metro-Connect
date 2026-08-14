-- Metro Connect — functions & triggers

-- updated_at bookkeeping -----------------------------------------------------

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at before update on profiles
  for each row execute function set_updated_at();
create trigger trg_commute_updated_at before update on commute_preferences
  for each row execute function set_updated_at();
create trigger trg_dating_updated_at before update on dating_preferences
  for each row execute function set_updated_at();

-- Auto-create a profile row the moment someone signs up via Supabase Auth,
-- and hand out a Founding Commuter number while the launch window is open.
-- The cutoff lives in app_settings so it can be closed without a migration.

create or replace function handle_new_user()
returns trigger as $$
declare
  cutoff integer;
  next_number integer;
begin
  select coalesce((value->>'founding_commuter_cutoff')::integer, 0)
    into cutoff
    from app_settings where key = 'growth';

  if cutoff > 0 then
    select count(*) + 1 into next_number from profiles where founding_commuter_number is not null;
  end if;

  insert into profiles (id, founding_commuter_number)
  values (
    new.id,
    case when cutoff > 0 and next_number <= cutoff then next_number else null end
  );

  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_handle_new_user
  after insert on auth.users
  for each row execute function handle_new_user();

-- A conversation is created automatically the moment a connection is
-- accepted — chat should never require a separate "start conversation" step.

create or replace function handle_connection_accepted()
returns trigger as $$
declare
  new_conversation_id uuid;
begin
  if new.status = 'accepted' and old.status is distinct from 'accepted' then
    new.responded_at = now();

    insert into conversations (connection_id) values (new.id)
      returning id into new_conversation_id;

    insert into conversation_members (conversation_id, user_id)
    values
      (new_conversation_id, new.requester_id),
      (new_conversation_id, new.addressee_id);

    insert into notifications (user_id, type, title, body, data)
    values (
      new.requester_id, 'connection_accepted', 'It''s a connection.',
      'You both commute the same route. Start with something easy.',
      jsonb_build_object('connectionId', new.id, 'conversationId', new_conversation_id)
    );
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_connection_accepted
  before update on connections
  for each row execute function handle_connection_accepted();

create or replace function handle_connection_requested()
returns trigger as $$
begin
  insert into notifications (user_id, type, title, body, data)
  values (
    new.addressee_id, 'connection_request', 'Someone on your route wants to connect.',
    'Take a look at their profile.',
    jsonb_build_object('connectionId', new.id, 'requesterId', new.requester_id)
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_connection_requested
  after insert on connections
  for each row execute function handle_connection_requested();

-- New-message notification (the realtime channel handles in-app delivery;
-- this keeps the notifications list — and future push — in sync).

create or replace function handle_new_message()
returns trigger as $$
declare
  recipient uuid;
  sender_name text;
begin
  select user_id into recipient
    from conversation_members
    where conversation_id = new.conversation_id and user_id <> new.sender_id
    limit 1;

  select coalesce(display_name, username, 'Someone') into sender_name
    from profiles where id = new.sender_id;

  if recipient is not null then
    insert into notifications (user_id, type, title, body, data)
    values (
      recipient, 'new_message', sender_name,
      left(new.body, 120),
      jsonb_build_object('conversationId', new.conversation_id, 'messageId', new.id)
    );
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_new_message
  after insert on messages
  for each row execute function handle_new_message();

-- Discovery — the only sanctioned way to list other commuters. Always
-- bounded, always paginated, always excludes blocked pairs, and always
-- returns a machine-checkable relevance reason instead of a fake score
-- (brief §23, §66). SECURITY DEFINER so RLS on other users' profiles never
-- has to be "readable by everyone" for this to work — see 0003_rls.sql for
-- the narrow policy this still runs under.

create or replace function discover_commuters(
  requesting_user uuid,
  result_limit integer default 20,
  result_offset integer default 0
)
returns table (
  user_id uuid,
  display_name text,
  avatar_url text,
  profession text,
  bio text,
  is_identity_verified boolean,
  is_commute_verified boolean,
  home_station_id uuid,
  destination_station_id uuid,
  metro_line_id uuid,
  start_time time,
  same_line boolean,
  same_home_station boolean,
  same_destination boolean,
  similar_time boolean,
  shared_interest_count integer
) as $$
begin
  return query
  with me as (
    select city_id from profiles where id = requesting_user
  ),
  my_commute as (
    select * from commute_preferences
    where user_id = requesting_user and is_active = true
  ),
  my_interests as (
    select interest_id from user_interests where user_id = requesting_user
  )
  select
    p.id,
    p.display_name,
    p.avatar_url,
    p.profession,
    p.bio,
    p.is_identity_verified,
    p.is_commute_verified,
    cp.home_station_id,
    cp.destination_station_id,
    cp.metro_line_id,
    cp.start_time,
    (cp.metro_line_id = mc.metro_line_id) as same_line,
    (cp.home_station_id = mc.home_station_id) as same_home_station,
    (cp.destination_station_id = mc.destination_station_id) as same_destination,
    (abs(extract(epoch from (cp.start_time - mc.start_time))) <= 1800) as similar_time,
    (select count(*)::integer from user_interests ui
       where ui.user_id = p.id and ui.interest_id in (select interest_id from my_interests)) as shared_interest_count
  from profiles p
  join commute_preferences cp on cp.user_id = p.id and cp.is_active = true
  cross join my_commute mc
  cross join me
  where p.id <> requesting_user
    and p.is_profile_complete = true
    and p.city_id = me.city_id
    and not exists (
      select 1 from blocks b
      where (b.blocker_id = requesting_user and b.blocked_id = p.id)
         or (b.blocker_id = p.id and b.blocked_id = requesting_user)
    )
    and (cp.metro_line_id = mc.metro_line_id
         or cp.home_station_id = mc.home_station_id
         or cp.destination_station_id = mc.destination_station_id)
  order by
    (cp.home_station_id = mc.home_station_id) desc,
    (cp.destination_station_id = mc.destination_station_id) desc,
    shared_interest_count desc,
    (abs(extract(epoch from (cp.start_time - mc.start_time)))) asc
  limit result_limit offset result_offset;
end;
$$ language plpgsql security definer set search_path = public;

-- Verification is a claim only the backend can make true (brief §34): a user
-- editing their own profile can never flip these columns themselves, no
-- matter what the client sends. Automated verification flows should run as
-- the `service_role` key (never shipped in the app) to pass this guard.

create or replace function guard_verification_columns()
returns trigger as $$
begin
  if auth.role() is distinct from 'service_role' then
    new.is_identity_verified = old.is_identity_verified;
    new.is_commute_verified = old.is_commute_verified;
    new.founding_commuter_number = old.founding_commuter_number;
  end if;
  return new;
end;
$$ language plpgsql security invoker;

create trigger trg_guard_verification_columns
  before update on profiles
  for each row execute function guard_verification_columns();

-- Membership check used by RLS policies that would otherwise need to
-- self-reference conversation_members (which RLS cannot do without
-- recursing into itself).

create or replace function is_conversation_member(target_conversation uuid, target_user uuid)
returns boolean as $$
  select exists (
    select 1 from conversation_members
    where conversation_id = target_conversation and user_id = target_user
  );
$$ language sql security definer set search_path = public stable;

-- Dating Lobby discovery — completely separate candidate pool from
-- discover_commuters, and only ever includes users who explicitly opted in
-- (brief §32).

create or replace function discover_dating_lobby(
  requesting_user uuid,
  result_limit integer default 20,
  result_offset integer default 0
)
returns table (
  user_id uuid,
  display_name text,
  avatar_url text,
  bio text,
  is_identity_verified boolean,
  show_commute_time boolean,
  metro_line_id uuid,
  shared_interest_count integer
) as $$
begin
  return query
  with me as (select city_id from profiles where id = requesting_user),
  my_interests as (select interest_id from user_interests where user_id = requesting_user)
  select
    p.id, p.display_name, p.avatar_url, p.bio, p.is_identity_verified,
    dp.show_commute_time,
    cp.metro_line_id,
    (select count(*)::integer from user_interests ui
       where ui.user_id = p.id and ui.interest_id in (select interest_id from my_interests)) as shared_interest_count
  from profiles p
  join dating_preferences dp on dp.user_id = p.id
  join me on true
  left join commute_preferences cp on cp.user_id = p.id and cp.is_active = true and cp.is_primary = true
  where p.id <> requesting_user
    and dp.is_opted_in = true
    and dp.show_in_lobby = true
    and p.city_id = me.city_id
    and exists (select 1 from dating_preferences my_dp where my_dp.user_id = requesting_user and my_dp.is_opted_in = true)
    and not exists (
      select 1 from blocks b
      where (b.blocker_id = requesting_user and b.blocked_id = p.id)
         or (b.blocker_id = p.id and b.blocked_id = requesting_user)
    )
  order by shared_interest_count desc
  limit result_limit offset result_offset;
end;
$$ language plpgsql security definer set search_path = public;

-- Referral funnel tracking (brief §44). Recording an "opened" event happens
-- before the person has an account, so this has to run as a definer RPC
-- rather than a direct table insert under RLS.

create or replace function record_referral_event(
  referral_code text,
  event_type_in referral_event_type,
  referred_user uuid default null
)
returns void as $$
declare
  target_referral_id uuid;
begin
  select id into target_referral_id from referrals where code = referral_code;
  if target_referral_id is null then
    return;
  end if;

  insert into referral_events (referral_id, event_type, referred_user_id)
  values (target_referral_id, event_type_in, referred_user);
end;
$$ language plpgsql security definer set search_path = public;

-- Row-level visibility gate for reading another user's profile/commute/
-- interests directly (as opposed to through the bounded discover_* RPCs).
-- Someone becomes viewable once there is an actual reason to show them:
-- a connection of any status, a shared conversation, or a live discovery
-- match (same city + route overlap). This is the enforcement brief §66
-- asks for — "never allow users to retrieve all registered users."

create or replace function can_view_profile(viewer uuid, target uuid)
returns boolean as $$
  select viewer = target
  or exists (
    select 1 from connections
    where (requester_id = viewer and addressee_id = target)
       or (requester_id = target and addressee_id = viewer)
  )
  or exists (
    select 1 from conversation_members cm1
    join conversation_members cm2 on cm1.conversation_id = cm2.conversation_id
    where cm1.user_id = viewer and cm2.user_id = target
  )
  or exists (
    select 1
    from commute_preferences mine
    join commute_preferences theirs
      on theirs.user_id = target and theirs.is_active = true
      and (theirs.metro_line_id = mine.metro_line_id
           or theirs.home_station_id = mine.home_station_id
           or theirs.destination_station_id = mine.destination_station_id)
    join profiles me on me.id = viewer
    join profiles them on them.id = target and them.city_id = me.city_id and them.is_profile_complete = true
    where mine.user_id = viewer and mine.is_active = true
  );
$$ language sql security definer set search_path = public stable;
