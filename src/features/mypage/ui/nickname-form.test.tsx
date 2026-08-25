// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useRouter } from 'next/navigation';
import { ApiError } from '@/shared/api/error';
import { useNicknameAvailability } from '@/features/auth/lib/use-nickname-availability';
import { updateNickname } from '@/features/mypage/api/update-nickname';
import { NicknameForm } from './nickname-form';

const routerRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ refresh: routerRefresh, push: vi.fn() })),
}));

vi.mock('@/features/mypage/api/update-nickname', () => ({
  updateNickname: vi.fn(),
}));

vi.mock('@/features/auth/lib/use-nickname-availability', () => ({
  useNicknameAvailability: vi.fn(() => 'idle'),
}));

const mockedUpdateNickname = vi.mocked(updateNickname);
const mockedUseNicknameAvailability = vi.mocked(useNicknameAvailability);
const mockedUseRouter = vi.mocked(useRouter);

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
  mockedUseRouter.mockReturnValue({
    refresh: routerRefresh,
    push: vi.fn(),
  } as unknown as ReturnType<typeof useRouter>);
});

/** 읽기 모드에서 "편집" 버튼을 눌러 입력 필드를 노출한다. */
async function startEditing(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: '편집' }));
}

describe('NicknameForm', () => {
  it('should render the current nickname as read-only text before editing starts', () => {
    render(<NicknameForm currentNickname="old-nick" />);

    expect(screen.getByText('old-nick')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '편집' })).toBeInTheDocument();
  });

  it('should show an input field focused on the current nickname when the edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<NicknameForm currentNickname="old-nick" />);

    await startEditing(user);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('old-nick');
  });

  it('should call updateNickname and router.refresh() when a new available nickname is submitted', async () => {
    const user = userEvent.setup();
    mockedUpdateNickname.mockResolvedValue('new-nick');

    render(<NicknameForm currentNickname="old-nick" />);
    await startEditing(user);

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'new-nick');
    await user.click(screen.getByRole('button', { name: /저장|변경/ }));

    await waitFor(() => expect(mockedUpdateNickname).toHaveBeenCalledWith('new-nick'));
    await waitFor(() => expect(routerRefresh).toHaveBeenCalled());
  });

  it('should not call updateNickname when the submitted nickname equals currentNickname', async () => {
    const user = userEvent.setup();

    render(<NicknameForm currentNickname="old-nick" />);
    await startEditing(user);

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'old-nick');
    await user.click(screen.getByRole('button', { name: /저장|변경/ }));

    await waitFor(() => expect(mockedUpdateNickname).not.toHaveBeenCalled());
    expect(routerRefresh).not.toHaveBeenCalled();
  });

  it('should show a validation error and not call updateNickname when nickname length is out of range (2~20자)', async () => {
    const user = userEvent.setup();

    render(<NicknameForm currentNickname="old-nick" />);
    await startEditing(user);

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'a');
    await user.click(screen.getByRole('button', { name: /저장|변경/ }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(mockedUpdateNickname).not.toHaveBeenCalled();
  });

  it("should show an error message and not update the header when updateNickname rejects with ApiError(409, 'CONFLICT')", async () => {
    const user = userEvent.setup();
    mockedUpdateNickname.mockRejectedValue(
      new ApiError(409, 'CONFLICT', '이미 사용 중인 닉네임입니다')
    );

    render(<NicknameForm currentNickname="old-nick" />);
    await startEditing(user);

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'taken-nick');
    await user.click(screen.getByRole('button', { name: /저장|변경/ }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('이미 사용 중인 닉네임입니다')
    );
    expect(routerRefresh).not.toHaveBeenCalled();
  });

  it('should show real-time availability status via useNicknameAvailability while typing', async () => {
    const user = userEvent.setup();
    mockedUseNicknameAvailability.mockReturnValue('available');

    render(<NicknameForm currentNickname="old-nick" />);
    await startEditing(user);

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'new-nick');

    expect(screen.getByText('사용 가능한 닉네임입니다')).toBeInTheDocument();
  });

  it('should return to read-only text without calling updateNickname when the cancel button is clicked', async () => {
    const user = userEvent.setup();

    render(<NicknameForm currentNickname="old-nick" />);
    await startEditing(user);

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'draft-nick');
    await user.click(screen.getByRole('button', { name: '취소' }));

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText('old-nick')).toBeInTheDocument();
    expect(mockedUpdateNickname).not.toHaveBeenCalled();
  });
});
