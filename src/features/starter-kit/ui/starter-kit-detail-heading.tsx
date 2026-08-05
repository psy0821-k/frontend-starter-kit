'use client';

import { useEffect, useRef } from 'react';

interface StarterKitDetailHeadingProps {
  children: React.ReactNode;
}

/**
 * 상세 페이지 제목. 마운트 시 포커스를 이동시켜, 모달 없이 바로 라우팅되는
 * 카드 클릭 흐름에서도 스크린리더 사용자가 현재 위치를 인지할 수 있게 합니다.
 */
export function StarterKitDetailHeading({ children }: StarterKitDetailHeadingProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <h1
      ref={headingRef}
      tabIndex={-1}
      className="mb-2 text-2xl font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {children}
    </h1>
  );
}
