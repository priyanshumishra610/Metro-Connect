import { HAS_SUPABASE_CONFIG } from '@/config/env';
import { supabase } from '@/lib/supabase';
import type { ReportCategory, ReportContext } from '@/types/database';
import { fail, fromSupabaseError, ok, type ServiceResult } from '@/utils/serviceResult';

export interface ReportInput {
  reporterId: string;
  reportedUserId?: string;
  context: ReportContext;
  category: ReportCategory;
  details?: string;
  conversationId?: string;
}

export async function submitReport(input: ReportInput): Promise<ServiceResult<null>> {
  if (!HAS_SUPABASE_CONFIG) return fail('not_configured');
  if (input.details && input.details.length > 1000) {
    return fail('validation', 'Details need to be 1000 characters or fewer.');
  }

  const { error } = await supabase.from('reports').insert({
    reporter_id: input.reporterId,
    reported_user_id: input.reportedUserId ?? null,
    context: input.context,
    category: input.category,
    details: input.details ?? null,
    conversation_id: input.conversationId ?? null,
  });

  if (error) return fail(fromSupabaseError(error).kind, error.message);
  return ok(null);
}
