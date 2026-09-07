// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/api/client';
import Header from './header';

const getCurrentUser = vi.fn();
const routerPush = vi.fn();
const routerRefresh = vi.fn();

vi.mock('@/shared/api/auth/get-current-user', () => ({
  getCurrentUser: (...args: unknown[]) => getCurrentUser(...args),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: routerPush, refresh: routerRefresh })),
}));

vi.mock('@/shared/api/client', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

const mockedApiPost = vi.mocked(apiClient.post);

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe('Header', () => {
  it('should render "마이페이지" link pointing to /mypage when user is logged in', async () => {
    getCurrentUser.mockResolvedValue({ id: 'user-1', nickname: 'tester' });

    const element = await Header();
    render(element);

    const link = screen.getByRole('link', { name: '마이페이지' });
    expect(link).toHaveAttribute('href', '/mypage');
  });

  it('should render "마이페이지" link even when user is not logged in', async () => {
    getCurrentUser.mockResolvedValue(null);

    const element = await Header();
    render(element);

    expect(screen.getByRole('link', { name: '마이페이지' })).toBeInTheDocument();
  });

  it('should show an Avatar with the first letter of the nickname in the header when rendered as a logged-in user (AC 1)', async () => {
    getCurrentUser.mockResolvedValue({ id: 'user-1', nickname: 'tester' });

    const element = await Header();
    render(element);

    expect(screen.getByText('t')).toBeInTheDocument();
  });

  it('should open a dropdown menu showing "{nickname}님" and "로그아웃" when the Avatar (dropdown trigger) is clicked (AC 2)', async () => {
    getCurrentUser.mockResolvedValue({ id: 'user-1', nickname: 'tester' });
    const user = userEvent.setup();

    const element = await Header();
    render(element);

    await user.click(screen.getByRole('button', { name: 'tester님 메뉴 열기' }));

    await waitFor(() => {
      expect(screen.getByText('tester님')).toBeInTheDocument();
    });
    expect(screen.getByRole('menuitem', { name: '로그아웃' })).toBeInTheDocument();
  });

  it('should call POST /api/auth/logout then redirect to /auth/login when "로그아웃" is clicked while the dropdown is open, same as before (AC 3)', async () => {
    getCurrentUser.mockResolvedValue({ id: 'user-1', nickname: 'tester' });
    mockedApiPost.mockResolvedValue({ success: true, data: null });
    const user = userEvent.setup();

    const element = await Header();
    render(element);

    await user.click(screen.getByRole('button', { name: 'tester님 메뉴 열기' }));
    const logoutItem = await screen.findByRole('menuitem', { name: '로그아웃' });
    await user.click(logoutItem);

    await waitFor(() => expect(mockedApiPost).toHaveBeenCalledWith('/api/auth/logout'));
    await waitFor(() => expect(routerPush).toHaveBeenCalledWith('/auth/login'));
  });

  it('should show only the "로그인" link without an Avatar/dropdown when rendered as a logged-out user (existing branch regression guard)', async () => {
    getCurrentUser.mockResolvedValue(null);

    const element = await Header();
    render(element);

    expect(screen.getByRole('link', { name: '로그인' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /메뉴 열기/ })).not.toBeInTheDocument();
  });

  it('should always point the "마이페이지" navigation link to /mypage regardless of login state (existing regression guard)', async () => {
    getCurrentUser.mockResolvedValue({ id: 'user-1', nickname: 'tester' });

    const loggedInElement = await Header();
    const { unmount } = render(loggedInElement);
    expect(screen.getByRole('link', { name: '마이페이지' })).toHaveAttribute('href', '/mypage');
    unmount();

    getCurrentUser.mockResolvedValue(null);
    const loggedOutElement = await Header();
    render(loggedOutElement);
    expect(screen.getByRole('link', { name: '마이페이지' })).toHaveAttribute('href', '/mypage');
  });
});
