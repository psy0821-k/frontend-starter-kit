import { apiClient } from '@/shared/api/client';
import type { ApiResponse } from '@/types/api';
import type { BookmarkState, BookmarkTarget } from '../model/types';

function toQueryString(target: BookmarkTarget): string {
  return `targetType=${target.targetType}&targetId=${target.targetId}`;
}

export async function getBookmarkState(target: BookmarkTarget): Promise<BookmarkState> {
  const response = await apiClient.get<ApiResponse<BookmarkState>>(
    `/api/bookmarks?${toQueryString(target)}`
  );
  return response.data as BookmarkState;
}

export async function addBookmark(target: BookmarkTarget): Promise<BookmarkState> {
  const response = await apiClient.post<ApiResponse<BookmarkState>>('/api/bookmarks', target);
  return response.data as BookmarkState;
}

export async function removeBookmark(target: BookmarkTarget): Promise<BookmarkState> {
  const response = await apiClient.delete<ApiResponse<BookmarkState>>(
    `/api/bookmarks?${toQueryString(target)}`
  );
  return response.data as BookmarkState;
}
