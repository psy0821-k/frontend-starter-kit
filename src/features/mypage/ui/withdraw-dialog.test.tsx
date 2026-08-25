// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useRouter } from 'next/navigation';
import { ApiError } from '@/shared/api/error';
import { apiClient } from '@/shared/api/client';
import { WithdrawDialog } from './withdraw-dialog';

const routerPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: routerPush, refresh: vi.fn() })),
}));

vi.mock('@/shared/api/client', () => ({
  apiClient: {
    delete: vi.fn(),
    post: vi.fn(),
  },
}));

const mockedUseRouter = vi.mocked(useRouter);
const mockedApiDelete = vi.mocked(apiClient.delete);
const mockedApiPost = vi.mocked(apiClient.post);

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
  mockedUseRouter.mockReturnValue({
    push: routerPush,
    refresh: vi.fn(),
  } as unknown as ReturnType<typeof useRouter>);
});

/** 다이얼로그를 열고 트리거만 클릭해둔 상태로 만든다. */
async function openDialog(user: ReturnType<typeof userEvent.setup>) {
  render(<WithdrawDialog currentNickname="my-nick" />);
  await user.click(screen.getByRole('button', { name: /탈퇴/ }));
}

describe('WithdrawDialog', () => {
  it('입력값이 currentNickname과 정확히 일치할 때 "탈퇴하기" 버튼이 활성화되어야 한다', async () => {
    const user = userEvent.setup();
    await openDialog(user);

    const input = screen.getByRole('textbox');
    await user.type(input, 'my-nick');

    expect(screen.getByRole('button', { name: '탈퇴하기' })).toBeEnabled();
  });

  it('활성화된 "탈퇴하기" 버튼을 클릭하면 DELETE /api/mypage/withdraw와 로그아웃을 호출하고 성공 시 홈(/)으로 리다이렉트해야 한다', async () => {
    const user = userEvent.setup();
    mockedApiDelete.mockResolvedValue({ success: true, data: null });
    mockedApiPost.mockResolvedValue({ success: true, data: null });
    await openDialog(user);

    const input = screen.getByRole('textbox');
    await user.type(input, 'my-nick');
    await user.click(screen.getByRole('button', { name: '탈퇴하기' }));

    await waitFor(() => expect(mockedApiDelete).toHaveBeenCalledWith('/api/mypage/withdraw'));
    await waitFor(() => expect(mockedApiPost).toHaveBeenCalledWith('/api/auth/logout'));
    await waitFor(() => expect(routerPush).toHaveBeenCalledWith('/'));
  });

  it('입력값이 비어 있을 때 "탈퇴하기" 버튼이 비활성 상태를 유지해야 한다', async () => {
    const user = userEvent.setup();
    await openDialog(user);

    expect(screen.getByRole('button', { name: '탈퇴하기' })).toBeDisabled();
  });

  it('입력값이 currentNickname과 대소문자/공백만 다를 때 버튼이 비활성 상태를 유지해야 한다 (exact match만 허용)', async () => {
    const user = userEvent.setup();
    await openDialog(user);

    const input = screen.getByRole('textbox');
    await user.type(input, 'my-nick ');

    expect(screen.getByRole('button', { name: '탈퇴하기' })).toBeDisabled();
  });

  it('닉네임을 잘못 입력했을 때 "탈퇴하기" 버튼이 비활성 상태를 유지해야 한다', async () => {
    const user = userEvent.setup();
    await openDialog(user);

    const input = screen.getByRole('textbox');
    await user.type(input, 'wrong-nick');

    expect(screen.getByRole('button', { name: '탈퇴하기' })).toBeDisabled();
  });

  it('DELETE /api/mypage/withdraw 호출이 실패하면(예: 502) 다이얼로그가 닫히지 않고 에러 메시지를 표시해야 한다', async () => {
    const user = userEvent.setup();
    mockedApiDelete.mockRejectedValue(
      new ApiError(502, 'UPSTREAM_ERROR', '회원 탈퇴에 실패했습니다')
    );
    await openDialog(user);

    const input = screen.getByRole('textbox');
    await user.type(input, 'my-nick');
    await user.click(screen.getByRole('button', { name: '탈퇴하기' }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('회원 탈퇴에 실패했습니다')
    );
    expect(routerPush).not.toHaveBeenCalled();
    // 다이얼로그가 닫히지 않아 입력 필드가 여전히 화면에 남아 있어야 한다.
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
