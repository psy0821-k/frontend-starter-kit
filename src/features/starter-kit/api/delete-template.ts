import { apiClient } from '@/shared/api/client';
import type { ApiResponse } from '@/types/api';

/** 템플릿을 삭제합니다. 연결된 파일과 Storage 썸네일도 서버에서 함께 정리됩니다. */
export async function deleteTemplate(id: string): Promise<void> {
  await apiClient.delete<ApiResponse<null>>(`/api/templates/${id}`);
}
