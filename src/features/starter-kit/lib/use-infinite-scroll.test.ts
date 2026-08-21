// @vitest-environment jsdom
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useInfiniteScroll } from './use-infinite-scroll';

/**
 * 테스트 전용 IntersectionObserver 목.
 * 실제 교차 이벤트를 트리거할 수 있도록 콜백과 disconnect 호출 여부를 캡처합니다.
 */
class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  callback: IntersectionObserverCallback;
  observedTarget: Element | null = null;
  disconnected = false;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }

  observe(target: Element) {
    this.observedTarget = target;
  }

  disconnect() {
    this.disconnected = true;
  }

  unobserve() {}

  trigger(isIntersecting: boolean) {
    this.callback(
      [{ isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver
    );
  }
}

describe('useInfiniteScroll', () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = [];
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sentinel이 뷰포트에 교차하면 onIntersect를 호출한다', () => {
    const sentinel = document.createElement('div');
    const sentinelRef = { current: sentinel };
    const onIntersect = vi.fn();

    renderHook(() => useInfiniteScroll({ sentinelRef, onIntersect, enabled: true }));

    expect(MockIntersectionObserver.instances).toHaveLength(1);
    MockIntersectionObserver.instances[0]?.trigger(true);

    expect(onIntersect).toHaveBeenCalledTimes(1);
  });

  it('언마운트되면 observer를 disconnect한다', () => {
    const sentinel = document.createElement('div');
    const sentinelRef = { current: sentinel };
    const onIntersect = vi.fn();

    const { unmount } = renderHook(() =>
      useInfiniteScroll({ sentinelRef, onIntersect, enabled: true })
    );

    const instance = MockIntersectionObserver.instances[0];
    expect(instance?.disconnected).toBe(false);

    unmount();

    expect(instance?.disconnected).toBe(true);
  });

  it('enabled가 false이면 observer를 생성하지 않는다', () => {
    const sentinel = document.createElement('div');
    const sentinelRef = { current: sentinel };
    const onIntersect = vi.fn();

    renderHook(() => useInfiniteScroll({ sentinelRef, onIntersect, enabled: false }));

    expect(MockIntersectionObserver.instances).toHaveLength(0);
  });

  it('sentinelRef.current가 null이면 observer를 생성하지 않는다', () => {
    const sentinelRef = { current: null };
    const onIntersect = vi.fn();

    renderHook(() => useInfiniteScroll({ sentinelRef, onIntersect, enabled: true }));

    expect(MockIntersectionObserver.instances).toHaveLength(0);
  });

  it('enabled가 false에서 true로 바뀌면 새 sentinel을 다시 관찰한다', () => {
    const sentinel = document.createElement('div');
    const sentinelRef = { current: sentinel };
    const onIntersect = vi.fn();

    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) =>
        useInfiniteScroll({ sentinelRef, onIntersect, enabled }),
      { initialProps: { enabled: false } }
    );

    expect(MockIntersectionObserver.instances).toHaveLength(0);

    rerender({ enabled: true });

    expect(MockIntersectionObserver.instances).toHaveLength(1);
    expect(MockIntersectionObserver.instances[0]?.observedTarget).toBe(sentinel);
  });
});
