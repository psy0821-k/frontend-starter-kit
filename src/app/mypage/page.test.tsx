// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import MyPage from './page';

const getCurrentUser = vi.fn();
const redirect = vi.fn();
const getMyBookmarks = vi.fn();

vi.mock('@/shared/api/auth/get-current-user', () => ({
  getCurrentUser: (...args: unknown[]) => getCurrentUser(...args),
}));

vi.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => redirect(...args),
}));

vi.mock('@/features/mypage/ui/nickname-form', () => ({
  NicknameForm: ({ currentNickname }: { currentNickname: string }) => (
    <div data-testid="nickname-form">{currentNickname}</div>
  ),
}));

vi.mock('@/features/mypage/api/get-my-bookmarks', () => ({
  getMyBookmarks: (...args: unknown[]) => getMyBookmarks(...args),
}));

vi.mock('@/features/mypage/ui/my-bookmark-list', () => ({
  MyBookmarkList: ({ items }: { items: unknown[] }) => (
    <div data-testid="my-bookmark-list">{items.length}</div>
  ),
}));

vi.mock('@/features/mypage/ui/withdraw-dialog', () => ({
  WithdrawDialog: () => <div data-testid="withdraw-dialog" />,
}));

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe('MyPage', () => {
  it('should render NicknameForm with currentNickname when user is logged in', async () => {
    getCurrentUser.mockResolvedValue({ id: 'user-1', nickname: 'tester' });
    getMyBookmarks.mockResolvedValue([]);

    const element = await MyPage();
    render(element);

    expect(screen.getByTestId('nickname-form')).toHaveTextContent('tester');
  });

  it('should pass getMyBookmarks result to MyBookmarkList as items when user is logged in', async () => {
    getCurrentUser.mockResolvedValue({ id: 'user-1', nickname: 'tester' });
    getMyBookmarks.mockResolvedValue([
      {
        targetType: 'template',
        targetId: 't-1',
        title: '템플릿',
        createdAt: '2026-08-22T00:00:00.000Z',
      },
      {
        targetType: 'feature',
        targetId: 'f-1',
        title: '기능',
        createdAt: '2026-08-21T00:00:00.000Z',
      },
    ]);

    const element = await MyPage();
    render(element);

    expect(getMyBookmarks).toHaveBeenCalledWith('user-1');
    expect(screen.getByTestId('my-bookmark-list')).toHaveTextContent('2');
  });

  it('should redirect to /auth/login when user is not logged in', async () => {
    getCurrentUser.mockResolvedValue(null);

    await MyPage();

    expect(redirect).toHaveBeenCalledWith('/auth/login');
  });
});
