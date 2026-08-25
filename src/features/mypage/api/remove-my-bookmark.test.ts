import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/shared/api/error';
import { removeMyBookmark } from './remove-my-bookmark';

const del = vi.fn();

vi.mock('@/shared/api/client', () => ({
  apiClient: {
    delete: (...args: unknown[]) => del(...args),
  },
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('removeMyBookmark', () => {
  it('올바른 쿼리스트링으로 apiClient.delete(/api/bookmarks)를 호출한다', async () => {
    del.mockResolvedValue({ success: true, data: { isBookmarked: false, count: 4 } });

    await removeMyBookmark({ targetType: 'template', targetId: 'abc' });

    expect(del).toHaveBeenCalledWith('/api/bookmarks?targetType=template&targetId=abc');
  });

  it('apiClient가 던진 ApiError를 그대로 전파한다', async () => {
    del.mockRejectedValue(new ApiError(500, 'INTERNAL_ERROR', '삭제 실패'));

    await expect(removeMyBookmark({ targetType: 'template', targetId: 'abc' })).rejects.toThrow(
      ApiError
    );
  });
});
