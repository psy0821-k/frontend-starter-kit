'use client';

import { useRef, useState, type ReactElement } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useInView } from '../lib/use-in-view';

gsap.registerPlugin(ScrollTrigger);

const DEMO_VIDEO_SOURCES = [
  { src: '/demo.webm', type: 'video/webm' },
  { src: '/demo.mp4', type: 'video/mp4' },
];

/**
 * 히어로와 설명 섹션 사이에 배치되는 데모 비디오 섹션.
 * 뷰포트에 진입하면 비디오를 자동 반복 재생하며, 스크롤에 따라 서서히
 * 커지는 인터랙션을 준다. prefers-reduced-motion 환경에서는 자동재생과
 * 스크롤 확대 없이 첫 프레임만 정지 상태로 노출한다.
 * 사용자가 재생/음소거/속도를 임의로 바꿀 수 없도록 controls는 제공하지 않는다.
 */
export function LandingVideoSection(): ReactElement {
  const sectionRef = useRef<HTMLElement | null>(null);
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

  useGSAP(() => {
    if (prefersReducedMotion || videoRef.current === null || sectionRef.current === null) {
      return;
    }

    gsap.fromTo(
      videoRef.current,
      { scale: 1 },
      {
        scale: 1.5,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom center',
          scrub: true,
        },
      }
    );
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="overflow-hidden px-4 pt-20 mt-30 mb-30 pb-20 sm:px-6 sm:pb-24 lg:px-8 lg:pb-32"
    >
      <video
        ref={videoRef}
        data-testid="landing-demo-video"
        preload="none"
        muted
        playsInline
        loop={!prefersReducedMotion}
        aria-label="웹 사이트 구현 영상"
        className="mx-auto aspect-video w-full max-w-4xl rounded-lg"
      >
        {DEMO_VIDEO_SOURCES.map((source) => (
          <source key={source.src} src={source.src} type={source.type} />
        ))}
      </video>
    </section>
  );
}
