// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { BookmarkButton } from './bookmark-button';

const push = vi.fn();
const getBookmarkState = vi.fn();
const addBookmark = vi.fn();
const removeBookmark = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}));

/**
 * useBookmark는 mock하지 않고 실제 구현을 그대로 쓴다.
 * bookmark-client.ts(네트워크 경계)만 mock해서, 버튼 클릭이라는 UI 이벤트가
 * 실제 TanStack Query mutation을 거쳐 화면 상태(aria-pressed)까지 바뀌는지 검증한다.
 */
vi.mock('../api/bookmark-client', () => ({
  getBookmarkState: (...args: unknown[]) => getBookmarkState(...args),
  addBookmark: (...args: unknown[]) => addBookmark(...args),
  removeBookmark: (...args: unknown[]) => removeBookmark(...args),
}));

function renderWithQueryClient(ui: ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

const target = { targetType: 'feature' as const, targetId: 'f-1' };

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('BookmarkButton — useBookmark 실통합', () => {
  it('미북마크 상태에서 클릭하면 버튼이 북마크됨 상태로 바뀐다', async () => {
    addBookmark.mockResolvedValue({ isBookmarked: true, count: 1 });
    const user = userEvent.setup();

    renderWithQueryClient(
      <BookmarkButton
        target={target}
        isAuthenticated={true}
        initialData={{ isBookmarked: false, count: 0 }}
      />
    );

    const button = screen.getByRole('button', { name: '북마크 추가' });
    expect(button).toHaveAttribute('aria-pressed', 'false');

    await user.click(button);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '북마크 해제' })).toHaveAttribute(
        'aria-pressed',
        'true'
      );
    });
    expect(addBookmark).toHaveBeenCalledWith(target);
  });

  it('북마크 상태에서 클릭하면 버튼이 북마크 안 됨 상태로 바뀐다', async () => {
    removeBookmark.mockResolvedValue({ isBookmarked: false, count: 0 });
    const user = userEvent.setup();

    renderWithQueryClient(
      <BookmarkButton
        target={target}
        isAuthenticated={true}
        initialData={{ isBookmarked: true, count: 1 }}
      />
    );

    const button = screen.getByRole('button', { name: '북마크 해제' });
    expect(button).toHaveAttribute('aria-pressed', 'true');

    await user.click(button);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '북마크 추가' })).toHaveAttribute(
        'aria-pressed',
        'false'
      );
    });
    expect(removeBookmark).toHaveBeenCalledWith(target);
  });
});
