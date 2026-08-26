'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface LandingDescriptionSectionProps {
  description: string;
}

/**
 * 히어로 아래 서비스 설명 섹션.
 * 배경 상단을 히어로 웨이브의 마지막 색(#E4E8FF)에서 흰색으로 이어지는
 * 그라디언트로 시작해, 히어로 배경과 이음매 없이 연결되게 한다.
 * 스크롤 진입 시 gsap으로 페이드인 + 위로 슬라이드하며 등장한다.
 */
export function LandingDescriptionSection({ description }: LandingDescriptionSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);

  useGSAP(() => {
    if (sectionRef.current === null) {
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const paragraph = sectionRef.current.querySelector('p');
    if (paragraph === null) {
      return;
    }

    if (prefersReducedMotion) {
      gsap.set(paragraph, { opacity: 1, y: 0 });
      return;
    }

    gsap.fromTo(
      paragraph,
      { opacity: 0, y: 32 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
        },
      }
    );
  });

  const sentences = description
    .split('.')
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);

  return (
    <section
      ref={sectionRef}
      data-testid="landing-description-section"
      className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8"
    >
      <p className="mx-auto flex max-w-2xl flex-col gap-2 text-center text-base leading-relaxed font-medium text-[#0A0A0A] sm:gap-3 sm:text-xl">
        {sentences.map((sentence, index) => (
          <span key={index} className="block">
            {sentence}.
          </span>
        ))}
      </p>
    </section>
  );
}
