'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { TerminalIdentity } from '../model/types';

interface TerminalHeroProps {
  identity: TerminalIdentity;
}

const TYPING_INTERVAL_MS = 35;
const LINE_PAUSE_MS = 400;

/**
 * 커맨드라인 프롬프트가 한 줄씩 타이핑되는 히어로 섹션.
 * prefers-reduced-motion이면 타이핑 없이 전체 텍스트를 즉시 보여준다.
 */
export function TerminalHero({ identity }: TerminalHeroProps) {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(query.matches);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setVisibleLines(identity.commandLines);
      return;
    }

    let cancelled = false;

    const typeLines = async () => {
      for (let lineIndex = 0; lineIndex < identity.commandLines.length; lineIndex += 1) {
        const fullLine = identity.commandLines[lineIndex];

        for (let charIndex = 1; charIndex <= fullLine.length; charIndex += 1) {
          if (cancelled) return;

          await new Promise((resolve) => setTimeout(resolve, TYPING_INTERVAL_MS));
          setVisibleLines((prev) => {
            const next = [...prev];
            next[lineIndex] = fullLine.slice(0, charIndex);
            return next;
          });
        }

        await new Promise((resolve) => setTimeout(resolve, LINE_PAUSE_MS));
      }
    };

    void typeLines();

    return () => {
      cancelled = true;
    };
  }, [identity.commandLines, reduceMotion]);

  return (
    <section className="border-b border-[#3a352c] bg-[#151312] px-6 py-20 text-[#faf6ee] sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-4xl flex-col items-start gap-8 sm:flex-row sm:items-center">
        <div className="relative size-[88px] shrink-0 overflow-hidden rounded-full border border-[#3a352c]">
          <Image src={identity.avatarUrl} alt={identity.name} fill className="object-cover" />
        </div>

        <div className="flex-1">
          <p className="mb-2 font-mono text-xs tracking-widest text-[#8a8578] uppercase">
            {identity.location}
          </p>
          <h1 className="mb-1 font-mono text-2xl font-bold tracking-tight sm:text-3xl">
            {identity.name}
          </h1>
          <p className="mb-6 text-sm text-[#8a8578]">{identity.role}</p>

          <div
            role="log"
            aria-label="자기소개 터미널"
            className="rounded-lg border border-[#3a352c] bg-[#0f0d0c] p-4 font-mono text-sm leading-relaxed"
          >
            {identity.commandLines.map((line, index) => (
              <p key={line} className="flex gap-2">
                <span className="text-[#e8632c]">$</span>
                <span>
                  {visibleLines[index] ?? ''}
                  {visibleLines[index]?.length !== line.length && (
                    <span className="animate-pulse text-[#e8632c]">▍</span>
                  )}
                </span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
