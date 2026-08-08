import type { AuthError } from '@supabase/supabase-js';
import { ApiError } from '@/shared/api/error';
import type { ApiErrorCode } from '@/types/api';

/**
 * Supabase Auth 에러 코드를 프로젝트 표준 ApiErrorCode로 매핑한다.
 * 매핑 테이블에 없는 코드는 INTERNAL_ERROR로 흡수해 원본 에러를 프론트엔드에 노출하지 않는다.
 */
const SUPABASE_ERROR_CODE_MAP: Record<string, ApiErrorCode> = {
  user_already_exists: 'CONFLICT',
  email_exists: 'CONFLICT',
  weak_password: 'VALIDATION_ERROR',
  validation_failed: 'VALIDATION_ERROR',
  invalid_credentials: 'INVALID_CREDENTIALS',
  email_not_confirmed: 'EMAIL_NOT_VERIFIED',
};

export function mapSupabaseAuthError(error: AuthError): ApiError {
  const code = SUPABASE_ERROR_CODE_MAP[error.code ?? ''] ?? 'INTERNAL_ERROR';
  const status = code === 'INTERNAL_ERROR' ? 500 : (error.status ?? 400);

  return new ApiError(status, code, error.message);
}
