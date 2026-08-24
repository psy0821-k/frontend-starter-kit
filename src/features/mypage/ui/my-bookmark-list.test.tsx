// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/shared/api/error';
import { removeBookmark } from '@/features/bookmark/api/bookmark-client';
import { MyBookmarkList } from './my-bookmark-list';
import type { MyBookmarkItem } from '../api/get-my-bookmarks';

const toastError = vi.fn();

vi.mock('sonner', () => ({
  toast: { error: (...args: unknown[]) => toastError(...args) },
}));

vi.mock('@/features/bookmark/api/bookmark-client', () => ({
  removeBookmark: vi.fn(),
}));

const mockedRemoveBookmark = vi.mocked(removeBookmark);

const items: MyBookmarkItem[] = [
  {
    targetType: 'template',
    targetId: 't-1',
    title: '템플릿 하나',
    createdAt: '2026-08-22T00:00:00.000Z',
  },
  {
    targetType: 'feature',
    targetId: 'f-1',
    title: '기능 하나',
    createdAt: '2026-08-21T00:00:00.000Z',
  },
];

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe('MyBookmarkList', () => {
  it('should render each item with its type badge label ("템플릿" for template, "기능" for feature) and title', () => {
    render(<MyBookmarkList items={items} />);

    expect(screen.getByText('템플릿')).toBeInTheDocument();
    expect(screen.getByText('기능')).toBeInTheDocument();
    expect(screen.getByText('템플릿 하나')).toBeInTheDocument();
    expect(screen.getByText('기능 하나')).toBeInTheDocument();
  });

  it("should call removeBookmark with the item's targetType and targetId and remove the item from the list when its delete button is clicked", async () => {
    const user = userEvent.setup();
    mockedRemoveBookmark.mockResolvedValue({ isBookmarked: false, count: 0 });

    render(<MyBookmarkList items={items} />);

    const deleteButtons = screen.getAllByRole('button');
    await user.click(deleteButtons[0]);

    await waitFor(() =>
      expect(mockedRemoveBookmark).toHaveBeenCalledWith({
        targetType: 'template',
        targetId: 't-1',
      })
    );
    await waitFor(() => expect(screen.queryByText('템플릿 하나')).not.toBeInTheDocument());
    expect(screen.getByText('기능 하나')).toBeInTheDocument();
  });

  it('should render the empty state message when items is an empty array', () => {
    render(<MyBookmarkList items={[]} />);

    expect(screen.getByText('아직 북마크한 항목이 없습니다')).toBeInTheDocument();
  });

  it('should keep the item in the list and show an error toast when removeBookmark rejects with an ApiError', async () => {
    const user = userEvent.setup();
    mockedRemoveBookmark.mockRejectedValue(new ApiError(500, 'INTERNAL_ERROR', '삭제 실패'));

    render(<MyBookmarkList items={items} />);

    const deleteButtons = screen.getAllByRole('button');
    await user.click(deleteButtons[0]);

    await waitFor(() => expect(toastError).toHaveBeenCalledTimes(1));
    expect(screen.getByText('템플릿 하나')).toBeInTheDocument();
  });

  it("should disable only the clicked item's delete button while its removeBookmark call is pending, leaving other items' buttons enabled", async () => {
    const user = userEvent.setup();
    let resolveRemove: (value: { isBookmarked: boolean; count: number }) => void = () => {};
    mockedRemoveBookmark.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRemove = resolve;
        })
    );

    render(<MyBookmarkList items={items} />);

    const deleteButtons = screen.getAllByRole('button');
    await user.click(deleteButtons[0]);

    await waitFor(() => expect(deleteButtons[0]).toBeDisabled());
    expect(deleteButtons[1]).toBeEnabled();

    resolveRemove({ isBookmarked: false, count: 0 });
    await waitFor(() => expect(screen.queryByText('템플릿 하나')).not.toBeInTheDocument());
  });
});
