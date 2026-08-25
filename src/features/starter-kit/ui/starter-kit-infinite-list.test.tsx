// @vitest-environment jsdom
import type { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StarterKitInfiniteList } from './starter-kit-infinite-list';
import { createMockStarterKit } from '../model/test-fixtures';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

/**
 * StarterKitCard가 렌더링하는 BookmarkButton이 useBookmark(TanStack Query)를 쓰므로,
 * 실제 앱(layout.tsx의 QueryProvider)과 동일하게 QueryClientProvider로 감싸서 렌더링한다.
 */
function renderList(ui: ReactElement) {
  const queryClient = new QueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

// jsdom에는 IntersectionObserver가 없으므로 useInfiniteScroll이 에러 없이 동작하도록 최소 스텁을 준다.
beforeEach(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('StarterKitInfiniteList', () => {
  it('selectedCategory와 일치하는 킷만 렌더링한다', () => {
    const starterKits = [
      createMockStarterKit({ id: 'erp-1', title: 'ERP 킷 1', category: 'erp' }),
      createMockStarterKit({ id: 'erp-2', title: 'ERP 킷 2', category: 'erp' }),
      createMockStarterKit({ id: 'portfolio-1', title: '포트폴리오 킷', category: '포트폴리오' }),
    ];

    renderList(
      <StarterKitInfiniteList
        starterKits={starterKits}
        selectedCategory="erp"
        searchQuery=""
        bookmarkedIds={new Set()}
        isAuthenticated={false}
      />
    );

    expect(screen.getByText('ERP 킷 1')).toBeInTheDocument();
    expect(screen.getByText('ERP 킷 2')).toBeInTheDocument();
    expect(screen.queryByText('포트폴리오 킷')).not.toBeInTheDocument();
  });

  it('starterKits는 있지만 selectedCategory에 일치하는 항목이 없으면 StarterKitFilteredEmptyState를 렌더링한다', () => {
    const starterKits = [
      createMockStarterKit({ id: 'portfolio-1', title: '포트폴리오 킷', category: '포트폴리오' }),
    ];

    renderList(
      <StarterKitInfiniteList
        starterKits={starterKits}
        selectedCategory="erp"
        searchQuery=""
        bookmarkedIds={new Set()}
        isAuthenticated={false}
      />
    );

    expect(screen.getByText('조건에 맞는 스타터 킷이 없습니다')).toBeInTheDocument();
    expect(screen.queryByText('포트폴리오 킷')).not.toBeInTheDocument();
  });

  it('aria-live 영역에 카테고리명과 결과 개수를 안내한다', async () => {
    const starterKits = [
      createMockStarterKit({ id: 'erp-1', title: 'ERP 킷 1', category: 'erp' }),
      createMockStarterKit({ id: 'erp-2', title: 'ERP 킷 2', category: 'erp' }),
    ];

    renderList(
      <StarterKitInfiniteList
        starterKits={starterKits}
        selectedCategory="erp"
        searchQuery=""
        bookmarkedIds={new Set()}
        isAuthenticated={false}
      />
    );

    await waitFor(() => {
      const status = screen.getByRole('status');
      expect(status.textContent).toContain('erp');
      expect(status.textContent).toContain('2개');
    });
  });

  it('selectedCategory가 "all"이면 aria-live 문구에 "전체"를 안내한다', async () => {
    const starterKits = [
      createMockStarterKit({ id: 'erp-1', title: 'ERP 킷 1', category: 'erp' }),
      createMockStarterKit({ id: 'portfolio-1', title: '포트폴리오 킷', category: '포트폴리오' }),
    ];

    renderList(
      <StarterKitInfiniteList
        starterKits={starterKits}
        selectedCategory="all"
        searchQuery=""
        bookmarkedIds={new Set()}
        isAuthenticated={false}
      />
    );

    await waitFor(() => {
      const status = screen.getByRole('status');
      expect(status.textContent).toContain('전체');
    });
  });

  it('bookmarkedIds에 포함된 카드는 isBookmarked=true로, 포함되지 않은 카드는 isBookmarked=false로 전달되어야 한다', () => {
    const starterKits = [
      createMockStarterKit({ id: 'erp-1', title: 'ERP 킷 1', category: 'erp' }),
      createMockStarterKit({ id: 'erp-2', title: 'ERP 킷 2', category: 'erp' }),
    ];

    renderList(
      <StarterKitInfiniteList
        starterKits={starterKits}
        selectedCategory="erp"
        searchQuery=""
        bookmarkedIds={new Set(['erp-1'])}
        isAuthenticated={true}
      />
    );

    const bookmarkButtons = screen.getAllByRole('button', { name: /북마크/ });
    expect(bookmarkButtons[0]).toHaveAttribute('aria-pressed', 'true');
    expect(bookmarkButtons[1]).toHaveAttribute('aria-pressed', 'false');
  });
});
