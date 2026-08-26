'use client';

import { useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const VIEWBOX_WIDTH = 1200;
const VIEWBOX_HEIGHT = 360;

/**
 * 웨이브 한 가닥의 기준값. baseY를 중심으로 컨트롤 포인트가 sin 곡선을 따라
 * 출렁여, 상하 평행이동이 아니라 곡선 형태 자체가 흐르는 파도가 되게 한다.
 * baseY는 화면 상단에 가깝게 두고, 뒤 레이어일수록 더 아래로 겹쳐 쌓는다.
 * 색상은 위(가장 얕은 레이어)가 가장 진하고 아래로 갈수록 옅어지도록 배치해,
 * 텍스트와 겹치는 하단 영역의 대비를 확보한다.
 */
const WAVE_CONFIGS = [
  { baseY: 105, amplitude: 45, speed: 1, phase: 0, fill: '#7A8CFF', opacity: 0.55 },
  { baseY: 105, amplitude: 25, speed: 0.8, phase: 2, fill: '#7A8CEB', opacity: 0.6 },
  { baseY: 105, amplitude: 12, speed: 1.2, phase: 4, fill: '#B0BCF5', opacity: 1 },
] as const;

/**
 * 두 개의 서로 다른 주파수 sin을 합성해 규칙적인 물결이 아니라 울렁이는 파도
 * 느낌을 낸다. 시작(x=0)과 끝(x=WIDTH) 지점은 baseY로 고정해, 웨이브가 가로로
 * 이어 붙일 때(반복 배치·좌우 대칭) 이음매 없이 자연스럽게 맞물리게 한다.
 */
function buildWaveCurve(baseY: number, amplitude: number, speed: number, phase: number, t: number) {
  const wave = (x: number) =>
    Math.sin(t * speed + phase + x / 220) + 0.3 * Math.sin(t * speed * 1.7 + phase + x / 90);

  const controlOffsetY = (x: number, sign: 1 | -1) => baseY + sign * amplitude * wave(x);

  const c1x = 200;
  const c2x = 400;
  const midX = 600;
  const c3x = 1000;
  const endX = VIEWBOX_WIDTH;

  const c1y = controlOffsetY(c1x, -1);
  const c2y = controlOffsetY(c2x, 1);
  const midY = baseY + amplitude * 0.5 * wave(midX);
  const c3y = controlOffsetY(c3x, -1);

  return `M0,${baseY} C ${c1x},${c1y} ${c2x},${c2y} ${midX},${midY} S ${c3x},${c3y} ${endX},${baseY}`;
}

/** 곡선 아래를 채우기 위해, 곡선 끝에서 화면 하단·좌측 하단을 거쳐 닫는 영역 path. */
function buildWaveFillPath(
  baseY: number,
  amplitude: number,
  speed: number,
  phase: number,
  t: number
) {
  const curve = buildWaveCurve(baseY, amplitude, speed, phase, t);
  return `${curve} L${VIEWBOX_WIDTH},${VIEWBOX_HEIGHT} L0,${VIEWBOX_HEIGHT} Z`;
}

/**
 * 히어로 배경을 가로지르는 웨이브. requestAnimationFrame으로 매 프레임 베지어
 * 컨트롤 포인트를 재계산해 곡선 자체가 파도처럼 일렁이게 한다. 각 웨이브 아래는
 * 서로 다른 톤으로 채워 레이어드 배경을 만든다.
 * prefers-reduced-motion 환경에서는 애니메이션 루프를 시작하지 않고 정지 상태로 둔다.
 */
export function HeroWaveBackground() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    let frameId: number | null = null;
    let elapsedBeforePause = 0;
    let resumedAt = performance.now();

    const tick = (now: number) => {
      const t = (elapsedBeforePause + (now - resumedAt)) / 1000;

      WAVE_CONFIGS.forEach((wave, index) => {
        const path = pathRefs.current[index];
        if (path === null) {
          return;
        }
        path.setAttribute(
          'd',
          buildWaveFillPath(wave.baseY, wave.amplitude, wave.speed, wave.phase, t)
        );
      });

      frameId = requestAnimationFrame(tick);
    };

    const start = () => {
      if (frameId !== null) {
        return;
      }
      resumedAt = performance.now();
      frameId = requestAnimationFrame(tick);
    };

    const pause = () => {
      if (frameId === null) {
        return;
      }
      cancelAnimationFrame(frameId);
      frameId = null;
      elapsedBeforePause += performance.now() - resumedAt;
    };

    /** 탭이 백그라운드로 가면 requestAnimationFrame을 멈춰 불필요한 연산을 줄인다. */
    const handleVisibilityChange = () => {
      if (document.hidden) {
        pause();
      } else {
        start();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    if (!document.hidden) {
      start();
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      pause();
    };
  }, []);

  /**
   * 히어로 섹션을 벗어나 스크롤할수록 웨이브가 서서히 옅어지며, 다음 섹션의
   * 배경(흰색)과 자연스럽게 이어지도록 한다. prefers-reduced-motion이면
   * scrub 애니메이션 없이 즉시 전환한다(트리거 자체는 접근성에 문제 없어 유지).
   */
  useGSAP(() => {
    if (svgRef.current === null) {
      return;
    }

    const heroSection = svgRef.current.closest('[data-testid="landing-hero-section"]');
    if (heroSection === null) {
      return;
    }

    gsap.to(svgRef.current, {
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: heroSection,
        start: 'center top',
        end: 'bottom top',
        scrub: true,
      },
    });
  });

  return (
    <svg
      ref={svgRef}
      aria-hidden
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <defs>
        {/* 가장 아래(가장 연한) 레이어만 하단으로 갈수록 흰 배경에 녹아들게 한다. */}
        <linearGradient id="hero-wave-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E4E8FF" />
          <stop offset="55%" stopColor="#E4E8FF" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </linearGradient>
      </defs>
      {WAVE_CONFIGS.map((wave, index) => (
        <path
          key={index}
          ref={(el) => {
            pathRefs.current[index] = el;
          }}
          d={buildWaveFillPath(wave.baseY, wave.amplitude, wave.speed, wave.phase, 0)}
          fill={index === WAVE_CONFIGS.length - 1 ? 'url(#hero-wave-fade)' : wave.fill}
          opacity={wave.opacity}
        />
      ))}
    </svg>
  );
}
