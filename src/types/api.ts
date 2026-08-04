/**
 * API 에러 코드 카탈로그 (단일 진실 공급원)
 * 새 에러 코드를 추가할 때는 백엔드와 협의 후 여기에 추가합니다.
 */
export type ApiErrorCode =
  | 'AUTH_REQUIRED'
  | 'INVALID_CREDENTIALS'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UPSTREAM_ERROR'
  | 'INTERNAL_ERROR';

/**
 * 일반적인 API 응답 구조
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: ApiErrorCode;
    message: string;
  };
}
