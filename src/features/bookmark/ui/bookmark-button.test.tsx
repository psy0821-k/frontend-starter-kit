// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { BookmarkButton } from './bookmark-button';

const push = vi.fn();
const toastError = vi.fn();
const useBookmark = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

vi.mock('sonner', () => ({
  toast: { error: (...args: unknown[]) => toastError(...args) },
}));

vi.mock('../model/use-bookmark', () => ({
  useBookmark: (...args: unknown[]) => useBookmark(...args),
}));

function renderWithQueryClient(ui: ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

const target = { targetType: 'template' as const, targetId: 'abc' };

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('BookmarkButton', () => {
  it('isBookmarked가 true면 채워진 상태로, false면 outline 상태로 렌더링한다', () => {
    useBookmark.mockReturnValue({
      isBookmarked: true,
      count: 5,
      isPending: false,
      toggle: vi.fn(),
    });

    renderWithQueryClient(
      <BookmarkButton
        target={target}
        isAuthenticated={true}
        initialData={{ isBookmarked: true, count: 5 }}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('아이콘 옆에 카운트를 표시한다', () => {
    useBookmark.mockReturnValue({
      isBookmarked: false,
      count: 12,
      isPending: false,
      toggle: vi.fn(),
    });

    renderWithQueryClient(<BookmarkButton target={target} isAuthenticated={true} />);

    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('로그인 사용자가 클릭하면 toggle()을 호출한다', async () => {
    const toggle = vi.fn();
    useBookmark.mockReturnValue({ isBookmarked: false, count: 0, isPending: false, toggle });
    const user = userEvent.setup();

    renderWithQueryClient(<BookmarkButton target={target} isAuthenticated={true} />);
    await user.click(screen.getByRole('button'));

    expect(toggle).toHaveBeenCalledTimes(1);
    expect(push).not.toHaveBeenCalled();
  });

  it('비로그인 사용자가 클릭하면 /auth/login으로 이동하고 toggle()은 호출하지 않는다', async () => {
    const toggle = vi.fn();
    useBookmark.mockReturnValue({ isBookmarked: false, count: 0, isPending: false, toggle });
    const user = userEvent.setup();

    renderWithQueryClient(<BookmarkButton target={target} isAuthenticated={false} />);
    await user.click(screen.getByRole('button'));

    expect(push).toHaveBeenCalledWith('/auth/login');
    expect(toggle).not.toHaveBeenCalled();
  });

  it('mutation 실패 시 에러 토스트를 표시하고 버튼은 실패 이전 상태(비북마크)로 되돌아가 있다', async () => {
    const toggle = vi.fn();
    useBookmark.mockImplementation(
      (_target: unknown, _initialData: unknown, options?: { onError?: () => void }) => {
        // BookmarkButton이 useBookmark에 onError 콜백을 전달하면, 실패 시 그 콜백이 토스트를 띄운다.
        toggle.mockImplementation(() => {
          options?.onError?.();
        });
        return { isBookmarked: false, count: 0, isPending: false, toggle };
      }
    );
    const user = userEvent.setup();

    renderWithQueryClient(<BookmarkButton target={target} isAuthenticated={true} />);
    await user.click(screen.getByRole('button'));

    expect(toastError).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });

  it('키보드로 접근 가능하고(Tab 이동) 북마크 상태를 나타내는 접근 가능한 레이블을 노출한다', async () => {
    useBookmark.mockReturnValue({
      isBookmarked: true,
      count: 3,
      isPending: false,
      toggle: vi.fn(),
    });
    const user = userEvent.setup();

    renderWithQueryClient(<BookmarkButton target={target} isAuthenticated={true} />);
    await user.tab();

    const button = screen.getByRole('button', { name: /북마크/ });
    expect(button).toHaveFocus();
  });
});
