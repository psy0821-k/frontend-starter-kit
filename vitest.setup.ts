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
