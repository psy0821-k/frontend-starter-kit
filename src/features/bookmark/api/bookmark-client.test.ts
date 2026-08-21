import { afterEach, describe, expect, it, vi } from 'vitest';
import { getBookmarkState, addBookmark, removeBookmark } from './bookmark-client';
import { ApiError } from '@/shared/api/error';

const get = vi.fn();
const post = vi.fn();
const del = vi.fn();

vi.mock('@/shared/api/client', () => ({
  apiClient: {
    get: (...args: unknown[]) => get(...args),
    post: (...args: unknown[]) => post(...args),
    delete: (...args: unknown[]) => del(...args),
  },
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('getBookmarkState', () => {
  it('올바른 쿼리스트링으로 apiClient.get을 호출하고 BookmarkState를 반환한다', async () => {
    get.mockResolvedValue({ success: true, data: { isBookmarked: true, count: 5 } });

    const result = await getBookmarkState({ targetType: 'template', targetId: 'abc' });

    expect(get).toHaveBeenCalledWith('/api/bookmarks?targetType=template&targetId=abc');
    expect(result).toEqual({ isBookmarked: true, count: 5 });
  });

  it('apiClient가 던진 ApiError를 그대로 전파한다', async () => {
    get.mockRejectedValue(new ApiError(500, 'INTERNAL_ERROR', '실패'));

    await expect(getBookmarkState({ targetType: 'template', targetId: 'abc' })).rejects.toThrow(
      ApiError
    );
  });
});

describe('addBookmark', () => {
  it('target을 요청 body에 담아 apiClient.post를 호출하고 BookmarkState를 반환한다', async () => {
    post.mockResolvedValue({ success: true, data: { isBookmarked: true, count: 6 } });

    const result = await addBookmark({ targetType: 'feature', targetId: 'search' });

    expect(post).toHaveBeenCalledWith('/api/bookmarks', {
      targetType: 'feature',
      targetId: 'search',
    });
    expect(result).toEqual({ isBookmarked: true, count: 6 });
  });
});

describe('removeBookmark', () => {
  it('올바른 쿼리스트링으로 apiClient.delete를 호출하고 BookmarkState를 반환한다', async () => {
    del.mockResolvedValue({ success: true, data: { isBookmarked: false, count: 4 } });

    const result = await removeBookmark({ targetType: 'template', targetId: 'abc' });

    expect(del).toHaveBeenCalledWith('/api/bookmarks?targetType=template&targetId=abc');
    expect(result).toEqual({ isBookmarked: false, count: 4 });
  });
});
