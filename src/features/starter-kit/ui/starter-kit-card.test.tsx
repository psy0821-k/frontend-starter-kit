// @vitest-environment jsdom
import type { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { StarterKitCard } from './starter-kit-card';
import { createMockStarterKit } from '../model/test-fixtures';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

/**
 * BookmarkButton이 useBookmark(TanStack Query)를 쓰므로, 실제 앱(layout.tsx의
 * QueryProvider)과 동일하게 QueryClientProvider로 감싸서 렌더링한다.
 */
function renderCard(ui: ReactElement) {
  const queryClient = new QueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

afterEach(() => {
  cleanup();
});

const baseKit = createMockStarterKit({
  id: 'kit-1',
  title: 'ERP 대시보드',
  summary: '재고와 매출을 한눈에 보는 대시보드',
  category: 'erp',
  tags: ['Next.js', 'TanStack Query', 'Recharts', 'Zustand'],
  thumbnail_url: 'https://example.com/thumb.png',
});

describe('StarterKitCard', () => {
  it('제목, 요약, 카테고리, 태그(최대 3개)와 초과 개수 배지를 표시한다', () => {
    renderCard(<StarterKitCard starterKit={baseKit} onSelect={vi.fn()} isBookmarked={false} />);

    expect(screen.getByText('ERP 대시보드')).toBeInTheDocument();
    expect(screen.getByText('재고와 매출을 한눈에 보는 대시보드')).toBeInTheDocument();
    expect(screen.getByText('erp')).toBeInTheDocument();
    expect(screen.getByText('Next.js')).toBeInTheDocument();
    expect(screen.getByText('TanStack Query')).toBeInTheDocument();
    expect(screen.getByText('Recharts')).toBeInTheDocument();
    expect(screen.queryByText('Zustand')).not.toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('등록 이후 수정된 적이 없으면 등록일을 표시한다', () => {
    renderCard(<StarterKitCard starterKit={baseKit} onSelect={vi.fn()} isBookmarked={false} />);

    expect(screen.getByText('등록')).toBeInTheDocument();
  });

  it('등록일과 수정일이 다르면 수정일을 표시한다', () => {
    const updatedKit = createMockStarterKit({ ...baseKit, updated_at: '2026-02-01T00:00:00.000Z' });
    renderCard(<StarterKitCard starterKit={updatedKit} onSelect={vi.fn()} isBookmarked={false} />);

    expect(screen.getByText('수정')).toBeInTheDocument();
  });

  it('role="button"과 tabIndex={0}을 가진 요소로 렌더링되어 Tab으로 포커스할 수 있다', async () => {
    const user = userEvent.setup();
    renderCard(<StarterKitCard starterKit={baseKit} onSelect={vi.fn()} isBookmarked={false} />);

    const card = screen.getByRole('button', { name: /ERP 대시보드/ });
    await user.tab();

    expect(card).toHaveFocus();
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it('Enter 키로 선택하면 onSelect가 호출된다', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderCard(<StarterKitCard starterKit={baseKit} onSelect={onSelect} isBookmarked={false} />);

    await user.tab();
    await user.keyboard('{Enter}');

    expect(onSelect).toHaveBeenCalledWith(baseKit);
  });

  it('Space 키로 선택하면 onSelect가 호출된다', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderCard(<StarterKitCard starterKit={baseKit} onSelect={onSelect} isBookmarked={false} />);

    await user.tab();
    await user.keyboard(' ');

    expect(onSelect).toHaveBeenCalledWith(baseKit);
  });

  it('클릭하면 onSelect에 해당 스타터 킷을 전달한다', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderCard(<StarterKitCard starterKit={baseKit} onSelect={onSelect} isBookmarked={false} />);

    await user.click(screen.getByRole('button', { name: /ERP 대시보드/ }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(baseKit);
  });

  it('포커스 시 outline 스타일 클래스를 가진다', () => {
    renderCard(<StarterKitCard starterKit={baseKit} onSelect={vi.fn()} isBookmarked={false} />);

    const card = screen.getByRole('button', { name: /ERP 대시보드/ });

    expect(card.className).toContain('focus-visible:outline');
  });

  it('isBookmarked가 true일 때 북마크 버튼이 북마크됨 상태로 렌더링되어야 한다', () => {
    renderCard(<StarterKitCard starterKit={baseKit} onSelect={vi.fn()} isBookmarked={true} />);

    const bookmarkButton = screen.getByRole('button', { name: '북마크 해제' });
    expect(bookmarkButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('북마크 버튼을 클릭하면 onSelect가 호출되지 않아야 한다', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderCard(<StarterKitCard starterKit={baseKit} onSelect={onSelect} isBookmarked={false} />);

    await user.click(screen.getByRole('button', { name: '북마크 추가' }));

    expect(onSelect).not.toHaveBeenCalled();
  });
});
