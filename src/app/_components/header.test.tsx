// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Header from './header';

const getCurrentUser = vi.fn();

vi.mock('@/shared/api/auth/get-current-user', () => ({
  getCurrentUser: (...args: unknown[]) => getCurrentUser(...args),
}));

vi.mock('@/features/auth/ui/logout-button', () => ({
  LogoutButton: () => <button type="button">로그아웃</button>,
}));

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

  it('should keep rendering "{nickname}님" text unchanged alongside the new link', async () => {
    getCurrentUser.mockResolvedValue({ id: 'user-1', nickname: 'tester' });

    const element = await Header();
    render(element);

    expect(screen.getByText('tester님')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '마이페이지' })).toBeInTheDocument();
  });

  it('should render "마이페이지" link even when user is not logged in', async () => {
    getCurrentUser.mockResolvedValue(null);

    const element = await Header();
    render(element);

    expect(screen.getByRole('link', { name: '마이페이지' })).toBeInTheDocument();
  });
});
