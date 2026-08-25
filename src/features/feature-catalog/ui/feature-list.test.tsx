// @vitest-environment jsdom
import type { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FeatureList } from './feature-list';
import { createMockFeature } from '../model/test-fixtures';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

/**
 * FeatureCard가 렌더링하는 BookmarkButton이 useBookmark(TanStack Query)를 쓰므로,
 * 실제 앱(layout.tsx의 QueryProvider)과 동일하게 QueryClientProvider로 감싸서 렌더링한다.
 */
function renderList(ui: ReactElement) {
  const queryClient = new QueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('FeatureList', () => {
  it('Feature 카드를 선택하면 /features/{id}로 이동해야 한다', async () => {
    const user = userEvent.setup();
    const features = [createMockFeature({ id: 'feature-1', title: '검색' })];
    renderList(
      <FeatureList features={features} bookmarkedIds={new Set()} isAuthenticated={false} />
    );

    await user.click(screen.getByRole('button', { name: /검색/ }));

    expect(push).toHaveBeenCalledWith('/features/feature-1');
  });

  it('bookmarkedIds에 포함된 카드는 isBookmarked=true로, 포함되지 않은 카드는 isBookmarked=false로 전달되어야 한다', () => {
    const features = [
      createMockFeature({ id: 'feature-1', title: '검색' }),
      createMockFeature({ id: 'feature-2', title: '게시판' }),
    ];
    renderList(
      <FeatureList
        features={features}
        bookmarkedIds={new Set(['feature-1'])}
        isAuthenticated={true}
      />
    );

    const bookmarkButtons = screen.getAllByRole('button', { name: /북마크/ });
    expect(bookmarkButtons[0]).toHaveAttribute('aria-pressed', 'true');
    expect(bookmarkButtons[1]).toHaveAttribute('aria-pressed', 'false');
  });
});
