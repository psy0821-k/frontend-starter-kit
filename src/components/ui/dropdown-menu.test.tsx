// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';

afterEach(() => {
  cleanup();
});

function renderMenu(onItemClick?: () => void) {
  return render(
    <DropdownMenu>
      <DropdownMenuTrigger>메뉴 열기</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={onItemClick}>첫번째 항목</DropdownMenuItem>
        <DropdownMenuItem onClick={onItemClick}>두번째 항목</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

describe('DropdownMenu', () => {
  it('should open DropdownMenuContent when DropdownMenuTrigger is clicked', async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByRole('button', { name: '메뉴 열기' }));

    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: '첫번째 항목' })).toBeInTheDocument();
    });
  });

  it("should call the item's onClick handler when a DropdownMenuItem is clicked in the opened menu", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    renderMenu(handleClick);

    await user.click(screen.getByRole('button', { name: '메뉴 열기' }));
    const item = await screen.findByRole('menuitem', { name: '첫번째 항목' });
    await user.click(item);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should move focus to the next/previous DropdownMenuItem when ArrowDown/ArrowUp is pressed in the opened menu', async () => {
    const user = userEvent.setup();
    renderMenu();

    // base-ui Menu는 마우스 클릭으로 연 경우 첫 항목에 자동 포커스를 주지 않는다.
    // 키보드(Tab으로 포커스 후 Enter)로 열면 첫 항목에 포커스가 이동하는 것이 base-ui의 실제 동작이다.
    await user.tab();
    expect(screen.getByRole('button', { name: '메뉴 열기' })).toHaveFocus();
    await user.keyboard('{Enter}');

    const firstItem = await screen.findByRole('menuitem', { name: '첫번째 항목' });
    const secondItem = screen.getByRole('menuitem', { name: '두번째 항목' });

    await waitFor(() => expect(firstItem).toHaveFocus());

    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(secondItem).toHaveFocus());

    await user.keyboard('{ArrowUp}');
    await waitFor(() => expect(firstItem).toHaveFocus());
  });

  it('should close the menu and return focus to DropdownMenuTrigger when Esc is pressed in the opened menu', async () => {
    const user = userEvent.setup();
    renderMenu();

    const trigger = screen.getByRole('button', { name: '메뉴 열기' });
    await user.click(trigger);
    await screen.findByRole('menuitem', { name: '첫번째 항목' });

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('menuitem', { name: '첫번째 항목' })).not.toBeInTheDocument();
    });
    expect(trigger).toHaveFocus();
  });

  it('should not call onClick when a disabled DropdownMenuItem is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>메뉴 열기</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleClick} disabled>
            비활성 항목
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    await user.click(screen.getByRole('button', { name: '메뉴 열기' }));
    const item = await screen.findByRole('menuitem', { name: '비활성 항목' });
    await user.click(item);

    expect(handleClick).not.toHaveBeenCalled();
  });
});
