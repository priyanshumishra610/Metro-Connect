import { shouldUseLocalData } from '@/lib/dataMode';
import { supabase } from '@/lib/supabase';
import { track } from '@/services/analytics';
import type { ReferralEventType } from '@/types/database';
import { fail, fromSupabaseError, ok, type ServiceResult } from '@/utils/serviceResult';

function generateCode(userId: string): string {
  const random = Math.random().toString(36).slice(2, 8);
  return `${userId.slice(0, 4)}${random}`.toUpperCase();
}

export async function getOrCreateReferralCode(userId: string): Promise<ServiceResult<string>> {
  if (shouldUseLocalData()) return ok('GUESTCODE');

  const { data: existing } = await supabase.from('referrals').select('code').eq('referrer_id', userId).maybeSingle();
  if (existing) return ok(existing.code);

  const { data, error } = await supabase
    .from('referrals')
    .insert({ referrer_id: userId, code: generateCode(userId) })
    .select('code')
    .single();

  if (error) return fail(fromSupabaseError(error).kind, error.message);
  return ok(data.code);
}

export function buildReferralLink(code: string): string {
  return `https://metroconnect.app/invite/${code}`;
}

export function buildReferralMessage(code: string): string {
  return `I'm trying Metro Connect. It connects people who take the same metro routes. You should join our route: ${buildReferralLink(code)}`;
}

/** Fire-and-forget funnel tracking (brief §44) — never blocks the UI on failure. */
export async function recordReferralEvent(code: string, eventType: ReferralEventType, referredUserId?: string): Promise<void> {
  if (shouldUseLocalData() || !code) return;
  await supabase.rpc('record_referral_event', {
    referral_code: code,
    event_type_in: eventType,
    referred_user: referredUserId ?? null,
  });

  const analyticsEventMap: Partial<Record<ReferralEventType, Parameters<typeof track>[0]>> = {
    sent: 'referral_shared',
    opened: 'referral_opened',
    converted: 'referral_completed',
  };
  const analyticsEvent = analyticsEventMap[eventType];
  if (analyticsEvent) track(analyticsEvent);
}
