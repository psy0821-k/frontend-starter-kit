// @vitest-environment jsdom
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useInView } from './use-in-view';

type IntersectionCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;

/**
 * jsdom에는 IntersectionObserver 기본 구현이 없어 mock 클래스로 대체한다.
 * observe() 호출 시 콜백을 저장해두고, 테스트에서 수동으로 호출해
 * "교차 발생"을 시뮬레이션한다.
 */
class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  callback: IntersectionCallback;
  observedElement: Element | null = null;
  disconnect = vi.fn();

  constructor(callback: IntersectionCallback) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }

  observe(element: Element) {
    this.observedElement = element;
  }

  unobserve = vi.fn();
}

describe('useInView', () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = [];
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('enabled가 true이고 ref 요소가 뷰포트에 교차하면 onEnter가 호출되어야 한다', () => {
    const element = document.createElement('div');
    const ref = { current: element };
    const onEnter = vi.fn();

    renderHook(() => useInView({ ref, onEnter, enabled: true }));

    expect(MockIntersectionObserver.instances).toHaveLength(1);
    const observerInstance = MockIntersectionObserver.instances[0];

    observerInstance.callback([{ isIntersecting: true }]);

    expect(onEnter).toHaveBeenCalledTimes(1);
  });

  it('enabled가 false이면 IntersectionObserver를 생성하지 않아야 한다', () => {
    const element = document.createElement('div');
    const ref = { current: element };
    const onEnter = vi.fn();

    renderHook(() => useInView({ ref, onEnter, enabled: false }));

    expect(MockIntersectionObserver.instances).toHaveLength(0);
  });

  it('ref.current가 null이면 관찰을 시작하지 않아야 한다', () => {
    const ref = { current: null };
    const onEnter = vi.fn();

    renderHook(() => useInView({ ref, onEnter, enabled: true }));

    expect(MockIntersectionObserver.instances).toHaveLength(0);
  });

  it('언마운트 시 observer.disconnect가 호출되어야 한다', () => {
    const element = document.createElement('div');
    const ref = { current: element };
    const onEnter = vi.fn();

    const { unmount } = renderHook(() => useInView({ ref, onEnter, enabled: true }));

    const observerInstance = MockIntersectionObserver.instances[0];

    unmount();

    expect(observerInstance.disconnect).toHaveBeenCalledTimes(1);
  });
});
