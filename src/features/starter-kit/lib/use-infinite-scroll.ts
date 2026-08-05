import { useEffect, type RefObject } from 'react';

interface UseInfiniteScrollOptions {
  /** 교차 여부를 관찰할 sentinel 요소의 ref */
  sentinelRef: RefObject<HTMLElement | null>;
  /** sentinel이 뷰포트에 교차했을 때 호출할 콜백 */
  onIntersect: () => void;
  /** 관찰 활성화 여부 (예: 더 로드할 항목이 없으면 false) */
  enabled: boolean;
}

/**
 * IntersectionObserver를 감싼 범용 무한스크롤 훅.
 * sentinel 교차 시 콜백만 호출하며, "몇 개씩 늘릴지"·"언제 리셋할지" 같은
 * 정책은 알지 못합니다(관찰과 정책의 분리).
 */
export function useInfiniteScroll({ sentinelRef, onIntersect, enabled }: UseInfiniteScrollOptions) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        onIntersect();
      }
    });

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [sentinelRef, onIntersect, enabled]);
}
