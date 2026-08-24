// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/shared/api/error';
import { removeMyBookmark } from '../api/remove-my-bookmark';
import { MyBookmarkList } from './my-bookmark-list';
import type { MyBookmarkItem } from '../api/get-my-bookmarks';

const toastError = vi.fn();

vi.mock('sonner', () => ({
  toast: { error: (...args: unknown[]) => toastError(...args) },
}));

vi.mock('../api/remove-my-bookmark', () => ({
  removeMyBookmark: vi.fn(),
}));

const mockedRemoveMyBookmark = vi.mocked(removeMyBookmark);

const items: MyBookmarkItem[] = [
  {
    targetType: 'template',
    targetId: 't-1',
    title: '템플릿 하나',
    thumbnailUrl: 'https://example.com/thumb.png',
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
  it('should render items grouped under "템플릿" and "기능" section headings', () => {
    render(<MyBookmarkList items={items} />);

    expect(screen.getByRole('heading', { name: '템플릿' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '기능' })).toBeInTheDocument();
    expect(screen.getByText('템플릿 하나')).toBeInTheDocument();
    expect(screen.getByText('기능 하나')).toBeInTheDocument();
  });

  it('should render a thumbnail image for a template item with thumbnailUrl but not for a feature item', () => {
    render(<MyBookmarkList items={items} />);

    expect(screen.getByRole('img', { name: '템플릿 하나 썸네일' })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: '기능 하나 썸네일' })).not.toBeInTheDocument();
  });

  it('should not render the "기능" section heading when there are no feature items', () => {
    render(<MyBookmarkList items={[items[0]]} />);

    expect(screen.getByRole('heading', { name: '템플릿' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '기능' })).not.toBeInTheDocument();
  });

  it("should call removeMyBookmark with the item's targetType and targetId and remove the item from the list when its bookmark toggle icon is clicked", async () => {
    const user = userEvent.setup();
    mockedRemoveMyBookmark.mockResolvedValue(undefined);

    render(<MyBookmarkList items={items} />);

    const toggleButtons = screen.getAllByRole('button', { name: '북마크 해제' });
    await user.click(toggleButtons[0]);

    await waitFor(() =>
      expect(mockedRemoveMyBookmark).toHaveBeenCalledWith({
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

  it('should keep the item in the list and show an error toast when removeMyBookmark rejects with an ApiError', async () => {
    const user = userEvent.setup();
    mockedRemoveMyBookmark.mockRejectedValue(new ApiError(500, 'INTERNAL_ERROR', '삭제 실패'));

    render(<MyBookmarkList items={items} />);

    const toggleButtons = screen.getAllByRole('button', { name: '북마크 해제' });
    await user.click(toggleButtons[0]);

    await waitFor(() => expect(toastError).toHaveBeenCalledTimes(1));
    expect(screen.getByText('템플릿 하나')).toBeInTheDocument();
  });

  it("should disable only the clicked item's bookmark toggle icon while its removeMyBookmark call is pending, leaving other items' toggles enabled", async () => {
    const user = userEvent.setup();
    let resolveRemove: () => void = () => {};
    mockedRemoveMyBookmark.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRemove = resolve;
        })
    );

    render(<MyBookmarkList items={items} />);

    const toggleButtons = screen.getAllByRole('button', { name: '북마크 해제' });
    await user.click(toggleButtons[0]);

    await waitFor(() => expect(toggleButtons[0]).toBeDisabled());
    expect(toggleButtons[1]).toBeEnabled();

    resolveRemove();
    await waitFor(() => expect(screen.queryByText('템플릿 하나')).not.toBeInTheDocument());
  });
});
