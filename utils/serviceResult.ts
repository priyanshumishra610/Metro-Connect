import { voice } from '@/constants/copy';

/**
 * Every /services function returns this shape instead of throwing. Screens
 * branch on `error.kind`, never on a raw Postgres/network error string.
 */
export type ServiceErrorKind =
  | 'offline'
  | 'timeout'
  | 'unauthorized'
  | 'validation'
  | 'rate_limited'
  | 'not_configured'
  | 'server_error'
  | 'cancelled'
  | 'guest_blocked';

export interface ServiceError {
  kind: ServiceErrorKind;
  message: string;
  cause?: unknown;
}

export type ServiceResult<T> = { data: T; error: null } | { data: null; error: ServiceError };

export function ok<T>(data: T): ServiceResult<T> {
  return { data, error: null };
}

export function fail(kind: ServiceErrorKind, message?: string, cause?: unknown): ServiceResult<never> {
  return { data: null, error: { kind, message: message ?? defaultMessage(kind), cause } };
}

function defaultMessage(kind: ServiceErrorKind): string {
  switch (kind) {
    case 'offline':
      return voice.offline;
    case 'timeout':
      return voice.networkTimeout;
    case 'unauthorized':
      return voice.unauthorized;
    case 'rate_limited':
      return voice.rateLimited;
    case 'not_configured':
      return "We're having trouble connecting.";
    case 'cancelled':
      return 'Sign-in was cancelled.';
    case 'guest_blocked':
      return 'Create an account to keep going.';
    case 'validation':
    case 'server_error':
    default:
      return voice.genericError;
  }
}

/** Normalizes a thrown/returned error from supabase-js into a ServiceError. */
export function fromSupabaseError(error: { message?: string; code?: string; status?: number } | null): ServiceError {
  if (!error) return { kind: 'server_error', message: voice.genericError };
  if (error.code === 'PGRST301' || error.status === 401 || error.status === 403) {
    return { kind: 'unauthorized', message: voice.unauthorized, cause: error };
  }
  if (error.status === 429) {
    return { kind: 'rate_limited', message: voice.rateLimited, cause: error };
  }
  if (error.message?.toLowerCase().includes('network')) {
    return { kind: 'offline', message: voice.offline, cause: error };
  }
  return { kind: 'server_error', message: voice.genericError, cause: error };
}
