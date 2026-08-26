import '@testing-library/jest-dom/vitest';

/**
 * gsap ScrollTrigger가 모듈 로드 시점(registerPlugin)에 matchMedia를 참조하는데,
 * jsdom은 기본 구현이 없어 테스트 파일별로 stub하기 전에 import가 먼저 실행되며
 * 깨진다. 전역으로 한 번 채워 모든 테스트에서 안전하게 동작하게 한다.
 */
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

/**
 * jsdom에는 IntersectionObserver 기본 구현이 없다. IntersectionObserver를 사용하는
 * 컴포넌트를 간접적으로만 렌더링하는 테스트(해당 훅 자체를 검증하지 않는 테스트)가
 * "IntersectionObserver is not defined"로 깨지지 않도록 아무 동작도 하지 않는
 * 최소 스텁을 전역으로 채운다. 훅의 교차 동작 자체를 검증하는 테스트는 각 파일에서
 * 자체 mock으로 이 스텁을 덮어쓴다(vi.stubGlobal).
 */
if (typeof window !== 'undefined' && typeof window.IntersectionObserver !== 'function') {
  class NoopIntersectionObserver implements IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin: string = '';
    readonly thresholds: ReadonlyArray<number> = [];
    disconnect(): void {}
    observe(): void {}
    unobserve(): void {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }

  window.IntersectionObserver = NoopIntersectionObserver;
}
