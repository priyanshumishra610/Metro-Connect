import type { RealtimeChannel } from '@supabase/supabase-js';

import { HAS_SUPABASE_CONFIG } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { track } from '@/services/analytics';
import type { Conversation, Message, Profile } from '@/types/database';
import { fail, fromSupabaseError, ok, type ServiceResult } from '@/utils/serviceResult';

export interface ConversationSummary {
  conversation: Conversation;
  counterpart: Profile;
  lastMessage: Message | null;
  unreadCount: number;
}

export async function listConversations(userId: string): Promise<ServiceResult<ConversationSummary[]>> {
  if (!HAS_SUPABASE_CONFIG) return ok([]);

  const { data: memberships, error } = await supabase
    .from('conversation_members')
    .select('conversation_id, last_read_at, conversations(*)')
    .eq('user_id', userId);

  if (error) return fail(fromSupabaseError(error).kind, error.message);
  if (!memberships || memberships.length === 0) return ok([]);

  const conversationIds = memberships.map((m) => m.conversation_id);

  const [{ data: otherMembers }, { data: lastMessages }] = await Promise.all([
    supabase
      .from('conversation_members')
      .select('conversation_id, profiles(*)')
      .in('conversation_id', conversationIds)
      .neq('user_id', userId),
    supabase
      .from('messages')
      .select('*')
      .in('conversation_id', conversationIds)
      .order('created_at', { ascending: false }),
  ]);

  const lastMessageByConversation = new Map<string, Message>();
  for (const message of (lastMessages ?? []) as Message[]) {
    if (!lastMessageByConversation.has(message.conversation_id)) {
      lastMessageByConversation.set(message.conversation_id, message);
    }
  }

  const counterpartByConversation = new Map<string, Profile>();
  for (const row of (otherMembers ?? []) as unknown as Array<{ conversation_id: string; profiles: Profile }>) {
    counterpartByConversation.set(row.conversation_id, row.profiles);
  }

  return ok(
    memberships
      .map((m) => {
        const counterpart = counterpartByConversation.get(m.conversation_id);
        if (!counterpart) return null;
        const lastMessage = lastMessageByConversation.get(m.conversation_id) ?? null;
        const unreadCount =
          lastMessage && (!m.last_read_at || new Date(lastMessage.created_at) > new Date(m.last_read_at)) ? 1 : 0;
        return {
          conversation: m.conversations as unknown as Conversation,
          counterpart,
          lastMessage,
          unreadCount,
        };
      })
      .filter((x): x is ConversationSummary => x !== null)
      .sort((a, b) => {
        const at = a.lastMessage?.created_at ?? a.conversation.created_at;
        const bt = b.lastMessage?.created_at ?? b.conversation.created_at;
        return new Date(bt).getTime() - new Date(at).getTime();
      })
  );
}

export interface ConversationContext {
  counterpart: Profile;
  routeNote: string | null;
}

/** Powers the "You both usually commute around 8 AM" header (brief §27) — reinforces why the conversation exists without exposing anything private. */
export async function getConversationContext(conversationId: string, userId: string): Promise<ServiceResult<ConversationContext | null>> {
  if (!HAS_SUPABASE_CONFIG) return ok(null);

  const { data: members, error } = await supabase
    .from('conversation_members')
    .select('user_id, profiles(*)')
    .eq('conversation_id', conversationId);

  if (error) return fail(fromSupabaseError(error).kind, error.message);

  const counterpartRow = (members ?? []).find((m) => m.user_id !== userId) as { profiles: Profile } | undefined;
  if (!counterpartRow) return ok(null);

  const { data: commutes } = await supabase
    .from('commute_preferences')
    .select('user_id, start_time')
    .in('user_id', [userId, counterpartRow.profiles.id])
    .eq('is_primary', true)
    .eq('is_active', true);

  let routeNote: string | null = null;
  const mine = commutes?.find((c) => c.user_id === userId);
  const theirs = commutes?.find((c) => c.user_id === counterpartRow.profiles.id);
  if (mine && theirs) {
    const [h] = mine.start_time.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    routeNote = `You both usually commute around ${hour12} ${period}.`;
  }

  return ok({ counterpart: counterpartRow.profiles, routeNote });
}

export async function listMessages(conversationId: string): Promise<ServiceResult<Message[]>> {
  if (!HAS_SUPABASE_CONFIG) return ok([]);
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(200);

  if (error) return fail(fromSupabaseError(error).kind, error.message);
  return ok((data ?? []) as Message[]);
}

export async function sendMessage(conversationId: string, senderId: string, body: string): Promise<ServiceResult<Message>> {
  if (!HAS_SUPABASE_CONFIG) return fail('not_configured');
  const trimmed = body.trim();
  if (!trimmed) return fail('validation', "That message is empty.");
  if (trimmed.length > 2000) return fail('validation', "That message is too long.");

  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, body: trimmed })
    .select('*')
    .single();

  if (error) return fail(fromSupabaseError(error).kind, error.message);
  track('message_sent');
  return ok(data as Message);
}

export async function markConversationRead(conversationId: string, userId: string): Promise<void> {
  if (!HAS_SUPABASE_CONFIG) return;
  await supabase
    .from('conversation_members')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId);
}

/**
 * Realtime message subscription (brief §27–28). Callers must call
 * `unsubscribe()` on unmount — this module never keeps a channel open
 * longer than the screen that asked for it.
 */
export function subscribeToConversation(conversationId: string, onMessage: (message: Message) => void): { unsubscribe: () => void } {
  if (!HAS_SUPABASE_CONFIG) return { unsubscribe: () => {} };

  const channel: RealtimeChannel = supabase
    .channel(`conversation:${conversationId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
      (payload) => onMessage(payload.new as Message)
    )
    .subscribe();

  return { unsubscribe: () => supabase.removeChannel(channel) };
}
