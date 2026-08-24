import { apiClient } from '@/shared/api/client';
import type { ApiResponse } from '@/types/api';
import type { MyBookmarkTargetType } from './get-my-bookmarks';

export interface RemoveMyBookmarkTarget {
  targetType: MyBookmarkTargetType;
  targetId: string;
}

/** GET/DELETE /api/bookmarks 응답 데이터 */
interface BookmarkState {
  isBookmarked: boolean;
  count: number;
}

/**
 * 기존 /api/bookmarks DELETE를 재사용해 북마크를 해제한다.
 * features/bookmark를 직접 import하지 않기 위해(feature간 직접 import 금지, CLAUDE.md)
 * mypage 자체 API로 별도 작성했다.
 */
export async function removeMyBookmark(target: RemoveMyBookmarkTarget): Promise<void> {
  await apiClient.delete<ApiResponse<BookmarkState>>(
    `/api/bookmarks?targetType=${target.targetType}&targetId=${target.targetId}`
  );
}
