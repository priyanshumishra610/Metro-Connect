-- Metro Connect — Row Level Security
-- RLS is the real enforcement boundary (brief §37) — every policy here must
-- hold even if the client is fully malicious. Reference tables (cities,
-- stations, interests, ...) are readable by any authenticated user; nothing
-- else is, by default, until a policy says otherwise.

alter table cities enable row level security;
alter table metro_systems enable row level security;
alter table metro_lines enable row level security;
alter table stations enable row level security;
alter table interests enable row level security;
alter table communities enable row level security;
alter table app_settings enable row level security;

alter table profiles enable row level security;
alter table commute_preferences enable row level security;
alter table user_interests enable row level security;
alter table connections enable row level security;
alter table conversations enable row level security;
alter table conversation_members enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;
alter table blocks enable row level security;
alter table reports enable row level security;
alter table verification enable row level security;
alter table dating_preferences enable row level security;
alter table community_members enable row level security;
alter table referrals enable row level security;
alter table referral_events enable row level security;

-- Reference data: readable by any signed-in user, writable only by service role.
create policy "reference data readable" on cities for select to authenticated using (true);
create policy "reference data readable" on metro_systems for select to authenticated using (true);
create policy "reference data readable" on metro_lines for select to authenticated using (true);
create policy "reference data readable" on stations for select to authenticated using (true);
create policy "reference data readable" on interests for select to authenticated using (true);
create policy "communities readable" on communities for select to authenticated using (true);
create policy "app settings readable" on app_settings for select to authenticated using (true);

-- profiles ---------------------------------------------------------------
create policy "profiles viewable when there is a reason" on profiles
  for select to authenticated
  using (can_view_profile(auth.uid(), id));

create policy "profiles updatable by owner" on profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
-- No insert policy: rows are created only by the handle_new_user trigger.
-- No delete policy: account deletion goes through a definer RPC (see services/account.ts).

-- commute_preferences ------------------------------------------------------
create policy "commute viewable when profile is viewable" on commute_preferences
  for select to authenticated
  using (user_id = auth.uid() or can_view_profile(auth.uid(), user_id));

create policy "commute manageable by owner" on commute_preferences
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- user_interests ------------------------------------------------------------
create policy "interests viewable when profile is viewable" on user_interests
  for select to authenticated
  using (user_id = auth.uid() or can_view_profile(auth.uid(), user_id));

create policy "interests manageable by owner" on user_interests
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- connections ----------------------------------------------------------------
create policy "connections visible to participants" on connections
  for select to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

create policy "connections requested by self" on connections
  for insert to authenticated
  with check (
    auth.uid() = requester_id
    and not exists (
      select 1 from blocks b
      where (b.blocker_id = requester_id and b.blocked_id = addressee_id)
         or (b.blocker_id = addressee_id and b.blocked_id = requester_id)
    )
  );

create policy "connections respondable by addressee" on connections
  for update to authenticated
  using (auth.uid() = addressee_id or auth.uid() = requester_id)
  with check (auth.uid() = addressee_id or auth.uid() = requester_id);

create policy "connections withdrawable by requester" on connections
  for delete to authenticated
  using (auth.uid() = requester_id and status = 'pending');

-- conversations & members -----------------------------------------------------
create policy "conversations visible to members" on conversations
  for select to authenticated
  using (is_conversation_member(id, auth.uid()));
-- No insert/update/delete policy: conversations are created only by the
-- handle_connection_accepted trigger.

create policy "conversation membership visible to co-members" on conversation_members
  for select to authenticated
  using (is_conversation_member(conversation_id, auth.uid()));

create policy "conversation membership self-updatable" on conversation_members
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- messages ---------------------------------------------------------------
create policy "messages visible to conversation members" on messages
  for select to authenticated
  using (is_conversation_member(conversation_id, auth.uid()));

create policy "messages sent by a member as themselves" on messages
  for insert to authenticated
  with check (sender_id = auth.uid() and is_conversation_member(conversation_id, auth.uid()));

-- notifications -----------------------------------------------------------
create policy "notifications visible to owner" on notifications
  for select to authenticated
  using (user_id = auth.uid());

create policy "notifications markable read by owner" on notifications
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "notifications deletable by owner" on notifications
  for delete to authenticated
  using (user_id = auth.uid());
-- No insert policy: notifications are only ever written by SECURITY DEFINER triggers.

-- blocks --------------------------------------------------------------------
-- Only the blocker can ever see a block they created — brief §35: never
-- reveal blocking details to the blocked user.
create policy "blocks visible to the blocker only" on blocks
  for select to authenticated
  using (blocker_id = auth.uid());

create policy "blocks created by the blocker" on blocks
  for insert to authenticated
  with check (blocker_id = auth.uid());

create policy "blocks removable by the blocker" on blocks
  for delete to authenticated
  using (blocker_id = auth.uid());

-- reports -----------------------------------------------------------------
create policy "reports visible to their author" on reports
  for select to authenticated
  using (reporter_id = auth.uid());

create policy "reports filed by the reporter" on reports
  for insert to authenticated
  with check (reporter_id = auth.uid());
-- No update/delete: report status is reviewed by the service role only.

-- verification --------------------------------------------------------------
create policy "verification visible to owner" on verification
  for select to authenticated
  using (user_id = auth.uid());
-- No insert/update/delete: verification is granted by a service-role process only.

-- dating_preferences ----------------------------------------------------------
create policy "dating preferences visible to owner" on dating_preferences
  for select to authenticated
  using (user_id = auth.uid());

create policy "dating preferences manageable by owner" on dating_preferences
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- community_members ----------------------------------------------------------
create policy "community membership visible to fellow members" on community_members
  for select to authenticated
  using (
    user_id = auth.uid()
    or community_id in (select community_id from community_members where user_id = auth.uid())
  );

create policy "community membership self-managed" on community_members
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "community membership leavable" on community_members
  for delete to authenticated
  using (user_id = auth.uid());

-- referrals -----------------------------------------------------------------
create policy "referrals visible to referrer" on referrals
  for select to authenticated
  using (referrer_id = auth.uid());

create policy "referrals created by referrer" on referrals
  for insert to authenticated
  with check (referrer_id = auth.uid());

create policy "referral events visible to referrer" on referral_events
  for select to authenticated
  using (
    referral_id in (select id from referrals where referrer_id = auth.uid())
  );
-- No direct insert policy: events are recorded through record_referral_event(),
-- which must work for a not-yet-registered visitor and so runs as a definer RPC.
