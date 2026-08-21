export const BOOKMARK_TARGET_TYPES = ['template', 'feature'] as const;
export type BookmarkTargetType = (typeof BOOKMARK_TARGET_TYPES)[number];

export interface BookmarkTarget {
  targetType: BookmarkTargetType;
  targetId: string;
}

/** GET /api/bookmarks 응답 데이터 */
export interface BookmarkState {
  isBookmarked: boolean;
  count: number;
}
