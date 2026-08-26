// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LandingVideoSection } from './landing-video-section';

type IntersectionCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;

/**
 * jsdom에는 IntersectionObserver 기본 구현이 없어 mock 클래스로 대체한다.
 * observe() 호출 시 콜백을 저장해두고, 테스트에서 수동으로 호출해
 * "교차 발생"을 시뮬레이션한다.
 */
class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  callback: IntersectionCallback;
  disconnect = vi.fn();

  constructor(callback: IntersectionCallback) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }

  observe = vi.fn();
  unobserve = vi.fn();
}

/** prefers-reduced-motion 쿼리 매칭 여부를 테스트별로 제어하기 위한 matchMedia mock. */
function mockMatchMedia(reduceMotion: boolean) {
  window.matchMedia = (query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? reduceMotion : false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

describe('LandingVideoSection', () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = [];
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
    mockMatchMedia(false);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    cleanup();
  });

  it('비디오 요소가 muted, playsInline 속성을 가져야 한다', () => {
    render(<LandingVideoSection />);

    const video = screen.getByTestId('landing-demo-video') as HTMLVideoElement;

    expect(video.muted).toBe(true);
    expect(video.playsInline).toBe(true);
  });

  it('비디오 요소가 preload="none" 속성을 가져야 한다', () => {
    render(<LandingVideoSection />);

    const video = screen.getByTestId('landing-demo-video') as HTMLVideoElement;

    expect(video.preload).toBe('none');
  });

  it('비디오 섹션이 뷰포트에 진입하면 play()가 호출되어야 한다', () => {
    render(<LandingVideoSection />);

    const video = screen.getByTestId('landing-demo-video') as HTMLVideoElement;
    const observerInstance = MockIntersectionObserver.instances[0];

    observerInstance.callback([{ isIntersecting: true }]);

    expect(video.play).toHaveBeenCalledTimes(1);
  });

  it('prefers-reduced-motion이 reduce일 때 뷰포트에 진입해도 play()가 호출되지 않아야 한다', () => {
    mockMatchMedia(true);

    render(<LandingVideoSection />);

    const video = screen.getByTestId('landing-demo-video') as HTMLVideoElement;

    if (MockIntersectionObserver.instances.length > 0) {
      const observerInstance = MockIntersectionObserver.instances[0];
      observerInstance.callback([{ isIntersecting: true }]);
    }

    expect(video.play).not.toHaveBeenCalled();
  });

  it('prefers-reduced-motion이 reduce일 때 비디오에 controls 속성이 부여되어 수동 재생이 가능해야 한다', () => {
    mockMatchMedia(true);

    render(<LandingVideoSection />);

    const video = screen.getByTestId('landing-demo-video') as HTMLVideoElement;

    expect(video.controls).toBe(true);
  });
});
