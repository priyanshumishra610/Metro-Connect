import { HAS_SUPABASE_CONFIG } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { track } from '@/services/analytics';
import type { Connection, ConnectionStatus, Profile } from '@/types/database';
import { fail, fromSupabaseError, ok, type ServiceResult } from '@/utils/serviceResult';

export interface ConnectionWithProfile extends Connection {
  counterpart: Profile;
}

export async function requestConnection(requesterId: string, addresseeId: string): Promise<ServiceResult<Connection>> {
  if (!HAS_SUPABASE_CONFIG) return fail('not_configured');

  const { data, error } = await supabase
    .from('connections')
    .insert({ requester_id: requesterId, addressee_id: addresseeId })
    .select('*')
    .single();

  if (error) return fail(fromSupabaseError(error).kind, error.message);
  track('connection_requested');
  return ok(data as Connection);
}

export async function respondToConnection(
  connectionId: string,
  status: Extract<ConnectionStatus, 'accepted' | 'declined'>
): Promise<ServiceResult<Connection>> {
  if (!HAS_SUPABASE_CONFIG) return fail('not_configured');

  const { data, error } = await supabase
    .from('connections')
    .update({ status })
    .eq('id', connectionId)
    .select('*')
    .single();

  if (error) return fail(fromSupabaseError(error).kind, error.message);
  if (status === 'accepted') track('connection_accepted');
  return ok(data as Connection);
}

/** The DB trigger that flips a connection to "accepted" also creates its conversation in the same transaction — this looks it up right after, so the UI can jump straight there (the "IT'S A CONNECTION." celebration's CTA). */
export async function getConversationIdForConnection(connectionId: string): Promise<ServiceResult<string | null>> {
  if (!HAS_SUPABASE_CONFIG) return ok(null);
  const { data, error } = await supabase.from('conversations').select('id').eq('connection_id', connectionId).maybeSingle();
  if (error) return fail(fromSupabaseError(error).kind, error.message);
  return ok(data?.id ?? null);
}

export async function withdrawConnection(connectionId: string): Promise<ServiceResult<null>> {
  if (!HAS_SUPABASE_CONFIG) return fail('not_configured');
  const { error } = await supabase.from('connections').delete().eq('id', connectionId);
  if (error) return fail(fromSupabaseError(error).kind, error.message);
  return ok(null);
}

async function listConnectionsByStatus(userId: string, status: ConnectionStatus): Promise<ServiceResult<ConnectionWithProfile[]>> {
  if (!HAS_SUPABASE_CONFIG) return ok([]);

  const { data, error } = await supabase
    .from('connections')
    .select('*, requester:profiles!connections_requester_id_fkey(*), addressee:profiles!connections_addressee_id_fkey(*)')
    .eq('status', status)
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) return fail(fromSupabaseError(error).kind, error.message);

  const rows = (data ?? []) as Array<Connection & { requester: Profile; addressee: Profile }>;
  return ok(
    rows.map((row) => ({
      ...row,
      counterpart: row.requester_id === userId ? row.addressee : row.requester,
    }))
  );
}

export const listAcceptedConnections = (userId: string) => listConnectionsByStatus(userId, 'accepted');

export async function listIncomingRequests(userId: string): Promise<ServiceResult<ConnectionWithProfile[]>> {
  if (!HAS_SUPABASE_CONFIG) return ok([]);
  const { data, error } = await supabase
    .from('connections')
    .select('*, requester:profiles!connections_requester_id_fkey(*)')
    .eq('status', 'pending')
    .eq('addressee_id', userId)
    .order('created_at', { ascending: false });

  if (error) return fail(fromSupabaseError(error).kind, error.message);
  const rows = (data ?? []) as Array<Connection & { requester: Profile }>;
  return ok(rows.map((row) => ({ ...row, counterpart: row.requester })));
}
