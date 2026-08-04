import type { ApiErrorCode } from '@/types/api';

/**
 * 모든 API 에러를 표준화하는 클래스
 * 에러 코드는 types/api.ts의 ApiErrorCode에서 관리됩니다.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: ApiErrorCode,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }
}
