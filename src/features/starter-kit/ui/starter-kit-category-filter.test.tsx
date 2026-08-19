// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StarterKitCategoryFilter } from './starter-kit-category-filter';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => '/templates',
  useSearchParams: () => new URLSearchParams(),
}));

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  pushMock.mockClear();
});

describe('StarterKitCategoryFilter', () => {
  it('카테고리 칩을 클릭하면 category 쿼리와 함께 router.push를 호출한다', async () => {
    const user = userEvent.setup();
    render(<StarterKitCategoryFilter selectedCategory="all" />);

    await user.click(screen.getByRole('button', { name: 'erp' }));

    expect(pushMock).toHaveBeenCalledWith('/templates?category=erp', { scroll: false });
  });

  it('다른 카테고리가 선택된 상태에서 All을 클릭하면 쿼리 없이 router.push를 호출한다', async () => {
    const user = userEvent.setup();
    render(<StarterKitCategoryFilter selectedCategory="erp" />);

    await user.click(screen.getByRole('button', { name: 'All' }));

    expect(pushMock).toHaveBeenCalledWith('/templates', { scroll: false });
  });

  it('selectedCategory에 해당하는 칩만 aria-pressed=true로 표시한다', () => {
    render(<StarterKitCategoryFilter selectedCategory="포트폴리오" />);

    expect(screen.getByRole('button', { name: '포트폴리오' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'erp' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: '쇼핑몰' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('키보드 포커스 후 Enter를 누르면 router.push가 호출된다', async () => {
    const user = userEvent.setup();
    render(<StarterKitCategoryFilter selectedCategory="all" />);

    await user.tab();
    await user.tab();
    await user.keyboard('{Enter}');

    expect(pushMock).toHaveBeenCalledWith('/templates?category=erp', { scroll: false });
  });

  it('키보드 포커스 후 Space를 누르면 router.push가 호출된다', async () => {
    const user = userEvent.setup();
    render(<StarterKitCategoryFilter selectedCategory="all" />);

    await user.tab();
    await user.tab();
    await user.keyboard('{ }');

    expect(pushMock).toHaveBeenCalledWith('/templates?category=erp', { scroll: false });
  });

  it('role="group"과 접근 가능한 라벨 "카테고리 필터"를 렌더링한다', () => {
    render(<StarterKitCategoryFilter selectedCategory="all" />);

    expect(screen.getByRole('group', { name: '카테고리 필터' })).toBeInTheDocument();
  });

  it('선택된 칩은 default variant, 비선택 칩은 outline variant 클래스를 가진다', () => {
    render(<StarterKitCategoryFilter selectedCategory="erp" />);

    const selectedButton = screen.getByRole('button', { name: 'erp' });
    const unselectedButton = screen.getByRole('button', { name: 'All' });

    expect(selectedButton.className).toContain('bg-primary');
    expect(unselectedButton.className).not.toContain('bg-primary');
  });
});
