// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { useBookmark } from './use-bookmark';

const getBookmarkState = vi.fn();
const addBookmark = vi.fn();
const removeBookmark = vi.fn();

vi.mock('../api/bookmark-client', () => ({
  getBookmarkState: (...args: unknown[]) => getBookmarkState(...args),
  addBookmark: (...args: unknown[]) => addBookmark(...args),
  removeBookmark: (...args: unknown[]) => removeBookmark(...args),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

const target = { targetType: 'template' as const, targetId: 'abc' };

afterEach(() => {
  vi.clearAllMocks();
});

describe('useBookmark', () => {
  it('initialData가 주어지면 추가 요청 없이 isBookmarked/count를 초기화한다', async () => {
    const { result } = renderHook(() => useBookmark(target, { isBookmarked: true, count: 5 }), {
      wrapper: createWrapper(),
    });

    expect(result.current.isBookmarked).toBe(true);
    expect(result.current.count).toBe(5);
    expect(getBookmarkState).not.toHaveBeenCalled();
  });

  it('북마크되지 않은 상태에서 toggle()을 호출하면 즉시 isBookmarked:true, count+1로 낙관적 반영한다', async () => {
    addBookmark.mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve({ isBookmarked: true, count: 6 }), 50))
    );

    const { result } = renderHook(() => useBookmark(target, { isBookmarked: false, count: 5 }), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.toggle();
    });

    await waitFor(() => {
      expect(result.current.isBookmarked).toBe(true);
      expect(result.current.count).toBe(6);
    });
  });

  it('북마크된 상태에서 toggle()을 호출하면 즉시 isBookmarked:false, count-1로 낙관적 반영한다', async () => {
    removeBookmark.mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve({ isBookmarked: false, count: 4 }), 50))
    );

    const { result } = renderHook(() => useBookmark(target, { isBookmarked: true, count: 5 }), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.toggle();
    });

    await waitFor(() => {
      expect(result.current.isBookmarked).toBe(false);
      expect(result.current.count).toBe(4);
    });
  });

  it('isPending인 동안 재클릭은 무시되어 mutation이 중복 실행되지 않는다', async () => {
    addBookmark.mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve({ isBookmarked: true, count: 6 }), 50))
    );

    const { result } = renderHook(() => useBookmark(target, { isBookmarked: false, count: 5 }), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.toggle();
      result.current.toggle();
    });

    await waitFor(() => {
      expect(result.current.isBookmarked).toBe(true);
    });

    expect(addBookmark).toHaveBeenCalledTimes(1);
  });

  it('mutation이 실패하면 클릭 이전 값으로 롤백한다', async () => {
    addBookmark.mockRejectedValue(new Error('network error'));

    const { result } = renderHook(() => useBookmark(target, { isBookmarked: false, count: 5 }), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.toggle();
    });

    await waitFor(() => {
      expect(result.current.isBookmarked).toBe(false);
      expect(result.current.count).toBe(5);
    });
  });

  it('연속 토글 후 onSettled 재검증을 거쳐 서버의 최종 상태로 수렴한다', async () => {
    addBookmark.mockResolvedValue({ isBookmarked: true, count: 6 });
    getBookmarkState.mockResolvedValue({ isBookmarked: true, count: 6 });

    const { result } = renderHook(() => useBookmark(target, { isBookmarked: false, count: 5 }), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.toggle();
    });

    await waitFor(() => {
      expect(result.current.isBookmarked).toBe(true);
      expect(result.current.count).toBe(6);
    });
  });
});
