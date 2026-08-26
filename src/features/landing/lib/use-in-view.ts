import { useEffect, type RefObject } from 'react';

interface UseInViewOptions {
  /** 교차 여부를 관찰할 요소의 ref */
  ref: RefObject<Element | null>;
  /** 요소가 뷰포트에 교차했을 때 호출할 콜백 */
  onEnter: () => void;
  /** 관찰 활성화 여부 */
  enabled: boolean;
}

/**
 * IntersectionObserver를 감싼 범용 뷰포트 진입 감지 훅.
 * 교차 시 콜백만 호출하며, 재생/애니메이션 등의 정책은 알지 못한다(관찰과 정책의 분리).
 */
export function useInView({ ref, onEnter, enabled }: UseInViewOptions): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const element = ref.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        onEnter();
      }
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, onEnter, enabled]);
}
