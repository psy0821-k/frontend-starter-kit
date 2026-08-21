// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StarterKitInfiniteList } from './starter-kit-infinite-list';
import { createMockStarterKit } from '../model/test-fixtures';
import type { StarterKit } from '../model/types';

const routerPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: routerPush }),
}));

/**
 * 테스트 전용 IntersectionObserver 목.
 * 마지막으로 생성된 instance를 통해 교차 이벤트를 수동으로 트리거합니다.
 */
class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }

  observe() {}
  disconnect() {}
  unobserve() {}

  trigger(isIntersecting: boolean) {
    this.callback(
      [{ isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver
    );
  }
}

function createKits(count: number): StarterKit[] {
  return Array.from({ length: count }, (_, index) =>
    createMockStarterKit({
      id: `kit-${index + 1}`,
      title: `스타터 킷 ${index + 1}`,
      category: '포트폴리오',
    })
  );
}

/** 그리드 바로 다음 형제인 sentinel div만 찾는다(카드 내부 div와 혼동 방지). */
function querySentinel(container: HTMLElement) {
  return container.querySelectorAll(':scope > div > .grid + div');
}

describe('StarterKitInfiniteList', () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = [];
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
    vi.stubGlobal('scrollTo', vi.fn());
    routerPush.mockClear();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    cleanup();
  });

  it('9개 초과 시 처음 9개만 렌더링한다', () => {
    const kits = createKits(12);
    render(<StarterKitInfiniteList starterKits={kits} selectedCategory="all" searchQuery="" />);

    expect(screen.getByText('스타터 킷 1')).toBeInTheDocument();
    expect(screen.getByText('스타터 킷 9')).toBeInTheDocument();
    expect(screen.queryByText('스타터 킷 10')).not.toBeInTheDocument();
  });

  it('sentinel이 교차하면 9개를 추가로 노출하고, 모두 노출되면 sentinel/스켈레톤을 제거한다', () => {
    const kits = createKits(15);
    const { container } = render(
      <StarterKitInfiniteList starterKits={kits} selectedCategory="all" searchQuery="" />
    );

    expect(screen.queryByText('스타터 킷 10')).not.toBeInTheDocument();

    act(() => {
      MockIntersectionObserver.instances[MockIntersectionObserver.instances.length - 1]?.trigger(
        true
      );
      vi.runAllTimers();
    });

    expect(screen.getByText('스타터 킷 10')).toBeInTheDocument();
    expect(screen.getByText('스타터 킷 15')).toBeInTheDocument();

    // 15개 모두 노출되었으므로 hasMore가 false가 되어 sentinel이 사라져야 한다.
    expect(querySentinel(container)).toHaveLength(0);
  });

  it('추가 로딩 중에는 스켈레톤 카드를 보여주고, 로딩이 끝나면 제거한다', () => {
    const kits = createKits(20);
    const { container } = render(
      <StarterKitInfiniteList starterKits={kits} selectedCategory="all" searchQuery="" />
    );

    act(() => {
      MockIntersectionObserver.instances[MockIntersectionObserver.instances.length - 1]?.trigger(
        true
      );
    });

    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(0);

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByText('스타터 킷 10')).toBeInTheDocument();
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(0);
  });

  it('sentinel 교차 직후 aria-live 영역에 로딩 시작 문구를 알린다', () => {
    const kits = createKits(15);
    render(<StarterKitInfiniteList starterKits={kits} selectedCategory="all" searchQuery="" />);

    act(() => {
      MockIntersectionObserver.instances[MockIntersectionObserver.instances.length - 1]?.trigger(
        true
      );
    });

    // setTimeout으로 완료 처리가 지연되는 사이, 시작 문구가 별도 렌더 사이클로 커밋되어야 한다.
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('추가 스타터 킷을 불러오는 중입니다');
  });

  it('추가 로딩 완료 시 aria-live 영역에 추가된 개수를 포함한 완료 문구를 알린다', () => {
    const kits = createKits(12);
    render(<StarterKitInfiniteList starterKits={kits} selectedCategory="all" searchQuery="" />);

    act(() => {
      MockIntersectionObserver.instances[MockIntersectionObserver.instances.length - 1]?.trigger(
        true
      );
      vi.runAllTimers();
    });

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('3개의 스타터 킷을 추가로 불러왔습니다');
  });

  it('카드를 선택하면 요약 모달 없이 /templates/[id]로 즉시 이동한다', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const kits = createKits(3);
    render(<StarterKitInfiniteList starterKits={kits} selectedCategory="all" searchQuery="" />);

    await user.click(screen.getByRole('button', { name: /스타터 킷 1/ }));

    expect(routerPush).toHaveBeenCalledWith('/templates/kit-1');
  });

  it('전체 항목이 9개 이하이면 sentinel/스켈레톤 없이 한 번에 모두 렌더링한다', () => {
    const kits = createKits(5);
    const { container } = render(
      <StarterKitInfiniteList starterKits={kits} selectedCategory="all" searchQuery="" />
    );

    expect(screen.getByText('스타터 킷 1')).toBeInTheDocument();
    expect(screen.getByText('스타터 킷 5')).toBeInTheDocument();
    expect(MockIntersectionObserver.instances).toHaveLength(0);
    expect(querySentinel(container)).toHaveLength(0);
  });

  it('전체 항목이 정확히 9개이면 sentinel 없이 모두 렌더링한다', () => {
    const kits = createKits(9);
    const { container } = render(
      <StarterKitInfiniteList starterKits={kits} selectedCategory="all" searchQuery="" />
    );

    expect(screen.getByText('스타터 킷 9')).toBeInTheDocument();
    expect(MockIntersectionObserver.instances).toHaveLength(0);
    expect(querySentinel(container)).toHaveLength(0);
  });

  it('selectedCategory가 바뀌면 visibleCount를 9로 리셋하고 스크롤을 맨 위로 이동한다', () => {
    const kits = createKits(15);
    const scrollToMock = vi.fn();
    vi.stubGlobal('scrollTo', scrollToMock);

    const { rerender } = render(
      <StarterKitInfiniteList starterKits={kits} selectedCategory="all" searchQuery="" />
    );

    act(() => {
      MockIntersectionObserver.instances[MockIntersectionObserver.instances.length - 1]?.trigger(
        true
      );
      vi.runAllTimers();
    });
    expect(screen.getByText('스타터 킷 10')).toBeInTheDocument();

    scrollToMock.mockClear();

    rerender(
      <StarterKitInfiniteList starterKits={kits} selectedCategory="포트폴리오" searchQuery="" />
    );

    expect(screen.queryByText('스타터 킷 10')).not.toBeInTheDocument();
    expect(scrollToMock).toHaveBeenCalledWith({ top: 0 });
  });

  it('searchQuery가 바뀌면 visibleCount를 9로 리셋하고 스크롤을 맨 위로 이동한다', () => {
    const kits = createKits(15);
    const scrollToMock = vi.fn();
    vi.stubGlobal('scrollTo', scrollToMock);

    const { rerender } = render(
      <StarterKitInfiniteList starterKits={kits} selectedCategory="all" searchQuery="" />
    );

    act(() => {
      MockIntersectionObserver.instances[MockIntersectionObserver.instances.length - 1]?.trigger(
        true
      );
      vi.runAllTimers();
    });
    expect(screen.getByText('스타터 킷 10')).toBeInTheDocument();

    scrollToMock.mockClear();

    rerender(
      <StarterKitInfiniteList starterKits={kits} selectedCategory="all" searchQuery="킷 1" />
    );

    expect(scrollToMock).toHaveBeenCalledWith({ top: 0 });
  });

  it('마지막 항목까지 모두 노출되면 sentinel과 로딩 인디케이터를 제거한다', () => {
    const kits = createKits(10);
    const { container } = render(
      <StarterKitInfiniteList starterKits={kits} selectedCategory="all" searchQuery="" />
    );

    expect(querySentinel(container)).toHaveLength(1);

    act(() => {
      MockIntersectionObserver.instances[MockIntersectionObserver.instances.length - 1]?.trigger(
        true
      );
      vi.runAllTimers();
    });

    expect(screen.getByText('스타터 킷 10')).toBeInTheDocument();
    expect(querySentinel(container)).toHaveLength(0);
  });

  it('로딩 완료 후 새 카드가 추가되어도 DOM 포커스와 스크롤 위치를 임의로 이동하지 않는다', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const kits = createKits(15);
    const scrollToMock = vi.fn();
    vi.stubGlobal('scrollTo', scrollToMock);
    render(<StarterKitInfiniteList starterKits={kits} selectedCategory="all" searchQuery="" />);

    const firstCard = screen.getByRole('button', { name: /스타터 킷 1/ });
    firstCard.focus();
    expect(firstCard).toHaveFocus();
    scrollToMock.mockClear();

    act(() => {
      MockIntersectionObserver.instances[MockIntersectionObserver.instances.length - 1]?.trigger(
        true
      );
      vi.runAllTimers();
    });

    expect(firstCard).toHaveFocus();
    expect(scrollToMock).not.toHaveBeenCalled();

    await user.tab();
    expect(screen.getByRole('button', { name: /스타터 킷 2/ })).toHaveFocus();
  });

  it('sentinel은 tabIndex 없는 div로 렌더링되어 키보드 Tab 순회에서 건너뛰어진다', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const kits = createKits(10);
    const { container } = render(
      <StarterKitInfiniteList starterKits={kits} selectedCategory="all" searchQuery="" />
    );

    const sentinel = querySentinel(container)[0];
    expect(sentinel).not.toBeUndefined();
    expect(sentinel?.tagName).toBe('DIV');
    expect(sentinel?.hasAttribute('tabindex')).toBe(false);

    // 실제 Tab 시퀀스로 sentinel을 건너뛰고 마지막 카드(9번)에서 문서 밖(body)으로 넘어가는지 확인한다.
    const lastCard = screen.getByRole('button', { name: /스타터 킷 9/ });
    lastCard.focus();
    expect(lastCard).toHaveFocus();

    await user.tab();
    expect(document.activeElement).not.toBe(sentinel);
  });

  it('starterKits가 빈 배열이면 전역 빈 상태를 렌더링한다', () => {
    render(<StarterKitInfiniteList starterKits={[]} selectedCategory="all" searchQuery="" />);

    expect(screen.getByText('등록된 스타터 킷이 없습니다')).toBeInTheDocument();
  });

  it('필터링 결과가 0개이면 필터 전용 빈 상태와 aria-live 안내를 렌더링한다', () => {
    const kits = createKits(3);
    render(
      <StarterKitInfiniteList starterKits={kits} selectedCategory="all" searchQuery="없는검색어" />
    );

    expect(screen.getByText('조건에 맞는 스타터 킷이 없습니다')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
