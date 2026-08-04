import { ApiError } from './error';
import { env } from '../config/env';
import type { ApiErrorCode, ApiResponse } from '@/types/api';

/**
 * API 통신 클래스
 * 모든 요청에 credentials를 자동으로 포함하고 (httpOnly 쿠키),
 * 에러를 ApiError로 표준화합니다.
 */
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl = env.NEXT_PUBLIC_API_BASE_URL || '') {
    this.baseUrl = baseUrl;
  }

  private async request<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include', // httpOnly 쿠키 자동 포함
        headers,
      });

      if (!response.ok) {
        let errorCode: ApiErrorCode = 'INTERNAL_ERROR';
        let errorMessage = response.statusText;

        try {
          const data = (await response.json()) as ApiResponse<unknown>;
          if (data.error) {
            errorCode = data.error.code;
            errorMessage = data.error.message;
          }
        } catch {
          // JSON 파싱 실패하면 기본 메시지 사용
        }

        throw new ApiError(response.status, errorCode, errorMessage);
      }

      return response.json() as Promise<T>;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        0,
        'INTERNAL_ERROR',
        error instanceof Error ? error.message : 'Unknown error',
        error
      );
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
