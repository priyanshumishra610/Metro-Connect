-- Metro Connect — account deletion (brief §39)
-- Deleting the auth.users row itself requires the Supabase Admin API
-- (service-role key), which must never ship inside the app — see
-- services/account.ts and docs/SUPABASE_SETUP.md for the two-step flow this
-- function is one half of: the client calls anonymize_own_account() directly,
-- then (documented, not wired here without real credentials) a server-side
-- process with the service-role key finishes by calling
-- supabase.auth.admin.deleteUser(userId).
--
-- This function strips personal data immediately and leaves a tombstone row
-- so existing conversations/connections don't orphan — messages a deleted
-- user sent still render as "Deleted user" instead of disappearing out from
-- under the other participant.

create or replace function anonymize_own_account()
returns void as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  delete from user_interests where user_id = uid;
  delete from commute_preferences where user_id = uid;
  delete from dating_preferences where user_id = uid;
  delete from community_members where user_id = uid;
  delete from notifications where user_id = uid;
  delete from connections where status = 'pending' and (requester_id = uid or addressee_id = uid);

  update profiles set
    username = null,
    display_name = 'Deleted user',
    avatar_url = null,
    bio = null,
    profession = null,
    education = null,
    is_profile_complete = false,
    is_identity_verified = false,
    is_commute_verified = false,
    is_dating_opted_in = false
  where id = uid;
end;
$$ language plpgsql security definer set search_path = public;
