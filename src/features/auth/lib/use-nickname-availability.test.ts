// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/api/client';
import { ApiError } from '@/shared/api/error';
import { useNicknameAvailability } from './use-nickname-availability';

vi.mock('@/shared/api/client', () => ({
  apiClient: { post: vi.fn() },
}));

const mockedPost = vi.mocked(apiClient.post);

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe('useNicknameAvailability', () => {
  it('닉네임이 빈 문자열이면 idle 상태이고 API를 호출하지 않는다', () => {
    const { result } = renderHook(() => useNicknameAvailability(''));

    expect(result.current).toBe('idle');
    expect(mockedPost).not.toHaveBeenCalled();
  });

  it('500ms 이내 연속 변경 시 마지막 값에 대해서만 1회 호출한다', async () => {
    vi.useFakeTimers();
    mockedPost.mockResolvedValue({ success: true, data: { available: true } });

    const { rerender } = renderHook(({ nickname }) => useNicknameAvailability(nickname), {
      initialProps: { nickname: '' },
    });

    act(() => rerender({ nickname: 'ab' }));
    await act(() => vi.advanceTimersByTimeAsync(200));
    act(() => rerender({ nickname: 'abc' }));
    await act(() => vi.advanceTimersByTimeAsync(500));

    expect(mockedPost).toHaveBeenCalledTimes(1);
    expect(mockedPost).toHaveBeenCalledWith('/api/auth/check-nickname', { nickname: 'abc' });
  });

  it('사용 가능한 닉네임이면 available 상태가 된다', async () => {
    mockedPost.mockResolvedValue({ success: true, data: { available: true } });

    const { result } = renderHook(() => useNicknameAvailability('nickname'));

    await waitFor(() => expect(result.current).toBe('available'));
  });

  it('이미 사용 중인 닉네임이면 unavailable 상태가 된다', async () => {
    mockedPost.mockResolvedValue({ success: true, data: { available: false } });

    const { result } = renderHook(() => useNicknameAvailability('nickname'));

    await waitFor(() => expect(result.current).toBe('unavailable'));
  });

  it('ApiError 발생 시 error 상태가 되고 예외를 다시 던지지 않는다', async () => {
    mockedPost.mockRejectedValue(new ApiError(500, 'INTERNAL_ERROR', '실패'));

    const { result } = renderHook(() => useNicknameAvailability('nickname'));

    await waitFor(() => expect(result.current).toBe('error'));
  });

  it('언마운트 후 응답이 와도 상태를 갱신하지 않는다', async () => {
    let resolvePost!: (value: { success: true; data: { available: boolean } }) => void;
    mockedPost.mockReturnValue(
      new Promise((resolve) => {
        resolvePost = resolve;
      })
    );

    const { result, unmount } = renderHook(() => useNicknameAvailability('nickname'));
    expect(result.current).toBe('checking');

    unmount();
    resolvePost({ success: true, data: { available: true } });
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(result.current).toBe('checking');
  });
});
