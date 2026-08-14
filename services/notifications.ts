import type { RealtimeChannel } from '@supabase/supabase-js';

import { HAS_SUPABASE_CONFIG } from '@/config/env';
import { supabase } from '@/lib/supabase';
import type { AppNotification } from '@/types/database';
import { fail, fromSupabaseError, ok, type ServiceResult } from '@/utils/serviceResult';

export async function listNotifications(userId: string): Promise<ServiceResult<AppNotification[]>> {
  if (!HAS_SUPABASE_CONFIG) return ok([]);
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return fail(fromSupabaseError(error).kind, error.message);
  return ok((data ?? []) as AppNotification[]);
}

export async function markNotificationRead(id: string): Promise<void> {
  if (!HAS_SUPABASE_CONFIG) return;
  await supabase.from('notifications').update({ is_read: true }).eq('id', id);
}

export async function unreadNotificationCount(userId: string): Promise<number> {
  if (!HAS_SUPABASE_CONFIG) return 0;
  const { count } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  return count ?? 0;
}

export function subscribeToNotifications(userId: string, onNotification: (n: AppNotification) => void): { unsubscribe: () => void } {
  if (!HAS_SUPABASE_CONFIG) return { unsubscribe: () => {} };

  const channel: RealtimeChannel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
      (payload) => onNotification(payload.new as AppNotification)
    )
    .subscribe();

  return { unsubscribe: () => supabase.removeChannel(channel) };
}
