'use client';

import { useEffect, useState } from 'react';
import { CheckIcon, CopyIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/shared/lib/cn';

const COPY_FEEDBACK_DURATION_MS = 2000;

interface CodeBlockProps {
  code: string;
  /** 복사 버튼의 aria-label과 스크롤 영역 라벨에 사용합니다. */
  filePath: string;
  className?: string;
}

/**
 * 줄번호와 복사 버튼을 갖춘 코드 표시 블록.
 *
 * 문법 하이라이팅은 의도적으로 넣지 않았습니다. 코드가 DB에서 오는 런타임
 * 입력이라 하이라이터를 쓰려면 dangerouslySetInnerHTML이 필요한데, React가
 * 텍스트로 이스케이프하게 두면 XSS 표면이 0이 됩니다. 실사용 목적이 "읽기"보다
 * "복사"에 가깝다는 판단도 함께 반영했습니다.
 */
export function CodeBlock({ code, filePath, className }: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);
  const lines = code.replace(/\n$/, '').split('\n');

  // 복사 성공 표시를 일정 시간 후 되돌린다. 파일을 전환하면 이전 파일의
  // 타이머가 남아 새 파일에 "복사됨"이 뜨는 것을 막기 위해 filePath도 의존성에 넣는다.
  useEffect(() => {
    if (!isCopied) return;

    const timerId = window.setTimeout(() => setIsCopied(false), COPY_FEEDBACK_DURATION_MS);
    return () => window.clearTimeout(timerId);
  }, [isCopied]);

  useEffect(() => {
    setIsCopied(false);
  }, [filePath]);

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
    } catch {
      // 클립보드 접근이 거부된 경우(비보안 컨텍스트 등) 조용히 무시한다.
      // 사용자는 코드를 직접 선택해 복사할 수 있다.
      setIsCopied(false);
    }
  };

  return (
    <div className={cn('relative overflow-hidden rounded-lg border border-border', className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => void handleCopyClick()}
        aria-label={`${filePath} 코드 복사`}
        className="absolute top-2 right-2 z-10 gap-1.5 bg-background/80 backdrop-blur-sm"
      >
        {isCopied ? <CheckIcon aria-hidden /> : <CopyIcon aria-hidden />}
        <span className="hidden sm:inline">{isCopied ? '복사됨' : '복사'}</span>
      </Button>

      {/*
        스크롤 가능한 영역은 키보드만으로도 스크롤할 수 있어야 한다(WCAG 2.1.1).
        tabIndex={0}이 없으면 마우스 없이 긴 코드의 아래쪽을 볼 수 없다.
      */}
      <div
        tabIndex={0}
        role="region"
        aria-label={`${filePath} 코드`}
        className="max-h-[60vh] overflow-auto bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:max-h-[70vh]"
      >
        <pre className="w-max min-w-full py-3 text-xs leading-relaxed sm:text-sm">
          <code>
            {lines.map((line, index) => (
              // 코드 줄은 순서가 곧 정체성이라(줄번호 = index) index를 key로 쓴다.
              <span key={index} className="flex">
                <span
                  aria-hidden
                  className="sticky left-0 shrink-0 basis-12 bg-muted/40 pr-3 text-right text-muted-foreground select-none sm:basis-14"
                >
                  {index + 1}
                </span>
                <span className="px-3 whitespace-pre">{line}</span>
              </span>
            ))}
          </code>
        </pre>
      </div>

      {/* 복사 결과를 스크린리더에 알린다. 시각적으로는 버튼 라벨이 대신한다. */}
      <span role="status" aria-live="polite" className="sr-only">
        {isCopied ? `${filePath} 코드를 복사했습니다` : ''}
      </span>
    </div>
  );
}
