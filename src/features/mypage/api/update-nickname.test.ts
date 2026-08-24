import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/api/client';
import { ApiError } from '@/shared/api/error';
import { updateNickname } from './update-nickname';

vi.mock('@/shared/api/client', () => ({
  apiClient: { put: vi.fn() },
}));

const mockedPut = vi.mocked(apiClient.put);

afterEach(() => {
  vi.clearAllMocks();
});

describe('updateNickname', () => {
  it('should return the updated nickname when the PUT request succeeds', async () => {
    mockedPut.mockResolvedValue({ success: true, data: { nickname: 'new-nick' } });

    const result = await updateNickname('new-nick');

    expect(result).toBe('new-nick');
    expect(mockedPut).toHaveBeenCalledWith('/api/mypage/nickname', { nickname: 'new-nick' });
  });

  it("should throw ApiError(500, 'INTERNAL_ERROR') when response.data is missing", async () => {
    mockedPut.mockResolvedValue({ success: true });

    await expect(updateNickname('new-nick')).rejects.toMatchObject({
      status: 500,
      code: 'INTERNAL_ERROR',
    });
  });

  it('should propagate ApiError when the PUT request fails (e.g. 409 CONFLICT)', async () => {
    mockedPut.mockRejectedValue(new ApiError(409, 'CONFLICT', '이미 사용 중인 닉네임입니다'));

    await expect(updateNickname('taken')).rejects.toMatchObject({
      status: 409,
      code: 'CONFLICT',
    });
  });
});
