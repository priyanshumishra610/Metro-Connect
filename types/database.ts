/** Hand-written types mirroring supabase/migrations/0001_schema.sql. */

export type CommuteFrequency = 'weekdays' | 'three_to_four_days' | 'few_days' | 'occasionally';
export type CommuteDirection = 'outbound' | 'return';
export type ConnectionStatus = 'pending' | 'accepted' | 'declined';
export type NotificationType =
  | 'connection_request'
  | 'connection_accepted'
  | 'new_message'
  | 'commute_update'
  | 'community_activity'
  | 'referral';
export type ReportCategory =
  | 'harassment'
  | 'spam'
  | 'fake_profile'
  | 'inappropriate_content'
  | 'safety_concern'
  | 'other';
export type ReportContext = 'profile' | 'chat' | 'connection' | 'dating_lobby';
export type ReportStatus = 'open' | 'reviewed' | 'actioned' | 'dismissed';
export type VerificationType = 'profile_complete' | 'commute_verified' | 'identity_verified';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type ReferralEventType = 'sent' | 'opened' | 'signup_completed' | 'commute_created' | 'converted';

export interface City {
  id: string;
  name: string;
  country: string;
  timezone: string;
  is_active: boolean;
  created_at: string;
}

export interface MetroSystem {
  id: string;
  city_id: string;
  name: string;
  created_at: string;
}

export interface MetroLine {
  id: string;
  metro_system_id: string;
  name: string;
  color_hex: string;
  created_at: string;
}

export interface Station {
  id: string;
  city_id: string;
  metro_system_id: string;
  metro_line_id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  sequence_number: number;
  is_active: boolean;
  interchange_group: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  profession: string | null;
  education: string | null;
  city_id: string | null;
  is_profile_complete: boolean;
  is_identity_verified: boolean;
  is_commute_verified: boolean;
  is_dating_opted_in: boolean;
  founding_commuter_number: number | null;
  created_at: string;
  updated_at: string;
}

export interface CommutePreference {
  id: string;
  user_id: string;
  direction: CommuteDirection;
  home_station_id: string;
  destination_station_id: string;
  metro_line_id: string;
  start_time: string; // "HH:MM:SS"
  end_time: string;
  days_of_week: number[];
  frequency: CommuteFrequency;
  is_primary: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Interest {
  id: string;
  slug: string;
  label: string;
  category: string;
  created_at: string;
}

export interface Connection {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: ConnectionStatus;
  created_at: string;
  responded_at: string | null;
}

export interface Conversation {
  id: string;
  connection_id: string | null;
  created_at: string;
}

export interface ConversationMember {
  conversation_id: string;
  user_id: string;
  joined_at: string;
  last_read_at: string | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface Block {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  context: ReportContext;
  category: ReportCategory;
  details: string | null;
  conversation_id: string | null;
  status: ReportStatus;
  created_at: string;
}

export interface Verification {
  id: string;
  user_id: string;
  type: VerificationType;
  status: VerificationStatus;
  verified_at: string | null;
  created_at: string;
}

export interface DatingPreference {
  user_id: string;
  is_opted_in: boolean;
  show_in_lobby: boolean;
  show_commute_time: boolean;
  interested_in: string[];
  min_age: number | null;
  max_age: number | null;
  created_at: string;
  updated_at: string;
}

export interface Community {
  id: string;
  interest_id: string | null;
  city_id: string | null;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  code: string;
  created_at: string;
}

/** Row shape returned by the discover_commuters() RPC — see 0002_functions.sql. */
export interface DiscoverCommuterRow {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  profession: string | null;
  bio: string | null;
  is_identity_verified: boolean;
  is_commute_verified: boolean;
  home_station_id: string;
  destination_station_id: string;
  metro_line_id: string;
  start_time: string;
  same_line: boolean;
  same_home_station: boolean;
  same_destination: boolean;
  same_interchange: boolean;
  similar_time: boolean;
  shared_interest_count: number;
}

/** Row shape returned by the discover_dating_lobby() RPC. */
export interface DiscoverDatingRow {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_identity_verified: boolean;
  show_commute_time: boolean;
  metro_line_id: string | null;
  shared_interest_count: number;
}
