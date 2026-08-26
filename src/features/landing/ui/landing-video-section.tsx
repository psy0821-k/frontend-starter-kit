'use client';

import { useRef, useState, type ReactElement } from 'react';
import { useInView } from '../lib/use-in-view';

const DEMO_VIDEO_SRC = '/videos/demo.mp4';

/**
 * 히어로와 설명 섹션 사이에 배치되는 데모 비디오 섹션.
 * 뷰포트에 진입하면 비디오를 1회 자동 재생하며, prefers-reduced-motion 환경에서는
 * 자동재생을 생략하고 controls로 사용자가 직접 재생할 수 있게 한다.
 */
export function LandingVideoSection(): ReactElement {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [prefersReducedMotion] = useState(
    () =>
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useInView({
    ref: videoRef,
    onEnter: () => {
      videoRef.current?.play();
    },
    enabled: !prefersReducedMotion,
  });

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <video
        ref={videoRef}
        data-testid="landing-demo-video"
        src={DEMO_VIDEO_SRC}
        preload="none"
        muted
        playsInline
        controls={prefersReducedMotion}
        className="mx-auto w-full max-w-4xl rounded-lg"
      />
    </section>
  );
}
