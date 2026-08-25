import { apiClient } from '@/shared/api/client';
import { ApiError } from '@/shared/api/error';
import type { ApiResponse } from '@/types/api';

/**
 * 닉네임을 변경합니다. 단일 필드 전체 교체이므로 PUT 의미론을 따른다
 * (features/starter-kit/api/update-template.ts 패턴 참조).
 */
export async function updateNickname(nickname: string): Promise<string> {
  const response = await apiClient.put<ApiResponse<{ nickname: string }>>('/api/mypage/nickname', {
    nickname,
  });

  if (!response.data) {
    throw new ApiError(500, 'INTERNAL_ERROR', '수정 결과를 확인하지 못했습니다');
  }

  return response.data.nickname;
}
