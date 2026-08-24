// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import MyPage from './page';

const getCurrentUser = vi.fn();
const redirect = vi.fn();

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

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe('MyPage', () => {
  it('should render NicknameForm with currentNickname when user is logged in', async () => {
    getCurrentUser.mockResolvedValue({ id: 'user-1', nickname: 'tester' });

    const element = await MyPage();
    render(element);

    expect(screen.getByTestId('nickname-form')).toHaveTextContent('tester');
  });

  it('should redirect to /auth/login when user is not logged in', async () => {
    getCurrentUser.mockResolvedValue(null);

    await MyPage();

    expect(redirect).toHaveBeenCalledWith('/auth/login');
  });
});
