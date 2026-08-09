import { apiClient } from '@/shared/api/client';
import { ApiError } from '@/shared/api/error';
import type { ApiResponse } from '@/types/api';
import type { CreateTemplateInput } from '../model/schema';

/**
 * 템플릿을 등록하고 생성된 id를 반환합니다.
 *
 * apiClient는 envelope 전체를 반환하므로(data만 꺼내주지 않음) 여기서 풀어
 * 호출부가 id만 다루게 합니다.
 */
export async function createTemplate(input: CreateTemplateInput): Promise<string> {
  const response = await apiClient.post<ApiResponse<{ id: string }>>('/api/templates', input);

  if (!response.data) {
    throw new ApiError(500, 'INTERNAL_ERROR', '등록 결과를 확인하지 못했습니다');
  }

  return response.data.id;
}
