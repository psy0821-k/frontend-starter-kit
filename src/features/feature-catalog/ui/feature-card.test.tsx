// @vitest-environment jsdom
import type { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FeatureCard } from './feature-card';
import { createMockFeature } from '../model/test-fixtures';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

/**
 * FeatureCard가 렌더링하는 BookmarkButton이 useBookmark(TanStack Query)를 쓰므로,
 * 실제 앱(layout.tsx의 QueryProvider)과 동일하게 QueryClientProvider로 감싸서 렌더링한다.
 */
function renderCard(ui: ReactElement) {
  const queryClient = new QueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

afterEach(() => {
  cleanup();
});

const baseFeature = createMockFeature({
  id: 'feature-1',
  title: '검색',
  description: '검색 기능',
  category: 'search',
});

describe('FeatureCard', () => {
  it('카드를 클릭하면 해당 feature와 함께 onSelect를 호출해야 한다', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderCard(<FeatureCard feature={baseFeature} onSelect={onSelect} isBookmarked={false} />);

    await user.click(screen.getByRole('button', { name: /검색/ }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(baseFeature);
  });

  it('포커스된 상태에서 Enter를 누르면 해당 feature와 함께 onSelect를 호출해야 한다', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderCard(<FeatureCard feature={baseFeature} onSelect={onSelect} isBookmarked={false} />);

    await user.tab();
    await user.keyboard('{Enter}');

    expect(onSelect).toHaveBeenCalledWith(baseFeature);
  });

  it('포커스된 상태에서 Space를 누르면 해당 feature와 함께 onSelect를 호출해야 한다', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderCard(<FeatureCard feature={baseFeature} onSelect={onSelect} isBookmarked={false} />);

    await user.tab();
    await user.keyboard(' ');

    expect(onSelect).toHaveBeenCalledWith(baseFeature);
  });

  it('role="button"과 tabIndex={0}을 가진 요소로 렌더링되고 focus-visible 스타일을 가져야 한다', () => {
    renderCard(<FeatureCard feature={baseFeature} onSelect={vi.fn()} isBookmarked={false} />);

    const card = screen.getByRole('button', { name: /검색/ });

    expect(card).toHaveAttribute('tabIndex', '0');
    expect(card.className).toContain('focus-visible:outline');
  });

  it('isBookmarked가 true일 때 북마크 버튼이 북마크됨 상태로 렌더링되어야 한다', () => {
    renderCard(<FeatureCard feature={baseFeature} onSelect={vi.fn()} isBookmarked={true} />);

    const bookmarkButton = screen.getByRole('button', { name: '북마크 해제' });
    expect(bookmarkButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('북마크 버튼을 클릭하면 onSelect가 호출되지 않아야 한다', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderCard(<FeatureCard feature={baseFeature} onSelect={onSelect} isBookmarked={false} />);

    await user.click(screen.getByRole('button', { name: '북마크 추가' }));

    expect(onSelect).not.toHaveBeenCalled();
  });
});
