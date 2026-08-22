-- Guest isolation. Guests never receive a JWT; they use the anon key
-- without a session. RLS is already enabled with no anon policies on
-- private tables. This migration makes that explicit so a misconfigured
-- grant cannot leak production users into a guest client.

revoke all on table profiles from anon;
revoke all on table commute_preferences from anon;
revoke all on table user_interests from anon;
revoke all on table connections from anon;
revoke all on table conversations from anon;
revoke all on table conversation_members from anon;
revoke all on table messages from anon;
revoke all on table notifications from anon;
revoke all on table blocks from anon;
revoke all on table reports from anon;
revoke all on table verification from anon;
revoke all on table dating_preferences from anon;
revoke all on table community_members from anon;
revoke all on table referrals from anon;
revoke all on table referral_events from anon;

-- Reference tables stay readable only to authenticated users (existing
-- policies). Anon still cannot select cities/stations/interests unless a
-- future product decision adds an explicit anon policy.
