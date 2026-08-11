import { describe, expect, it } from 'vitest';
import type { AuthError } from '@supabase/supabase-js';
import { mapSupabaseAuthError } from './map-error';

function createAuthError(code: string, status = 400, message = 'error'): AuthError {
  return { code, status, message, name: 'AuthApiError' } as AuthError;
}

describe('mapSupabaseAuthError', () => {
  it('user_already_exists를 CONFLICT로 매핑한다', () => {
    const result = mapSupabaseAuthError(createAuthError('user_already_exists', 422));

    expect(result.code).toBe('CONFLICT');
    expect(result.status).toBe(422);
  });

  it('email_exists를 CONFLICT로 매핑한다', () => {
    const result = mapSupabaseAuthError(createAuthError('email_exists', 422));

    expect(result.code).toBe('CONFLICT');
  });

  it('weak_password를 VALIDATION_ERROR로 매핑한다', () => {
    const result = mapSupabaseAuthError(createAuthError('weak_password'));

    expect(result.code).toBe('VALIDATION_ERROR');
  });

  it('invalid_credentials를 INVALID_CREDENTIALS로 매핑한다', () => {
    const result = mapSupabaseAuthError(createAuthError('invalid_credentials'));

    expect(result.code).toBe('INVALID_CREDENTIALS');
  });

  it('email_not_confirmed를 EMAIL_NOT_VERIFIED로 매핑한다', () => {
    const result = mapSupabaseAuthError(createAuthError('email_not_confirmed'));

    expect(result.code).toBe('EMAIL_NOT_VERIFIED');
  });

  it('매핑 테이블에 없는 코드는 INTERNAL_ERROR와 status 500으로 흡수한다', () => {
    const result = mapSupabaseAuthError(createAuthError('some_unknown_code', 400));

    expect(result.code).toBe('INTERNAL_ERROR');
    expect(result.status).toBe(500);
  });
});
