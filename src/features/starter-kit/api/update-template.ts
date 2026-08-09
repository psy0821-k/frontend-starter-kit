import { apiClient } from '@/shared/api/client';
import { ApiError } from '@/shared/api/error';
import type { ApiResponse } from '@/types/api';
import type { CreateTemplateInput } from '../model/schema';

/**
 * 템플릿을 수정합니다. 전체 교체(PUT) 의미론이라 files는 항상 전체 배열을
 * 보내야 합니다 — 서버가 기존 파일을 전량 삭제 후 재삽입합니다
 * (app/api/templates/[id]/route.ts 참조).
 */
export async function updateTemplate(id: string, input: CreateTemplateInput): Promise<string> {
  const response = await apiClient.put<ApiResponse<{ id: string }>>(`/api/templates/${id}`, input);

  if (!response.data) {
    throw new ApiError(500, 'INTERNAL_ERROR', '수정 결과를 확인하지 못했습니다');
  }

  return response.data.id;
}
