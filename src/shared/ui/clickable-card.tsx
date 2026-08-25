import type { KeyboardEvent, ReactNode } from 'react';

interface ClickableCardProps {
  onSelect: () => void;
  children: ReactNode;
  className?: string;
}

const DEFAULT_CLASS_NAME =
  'block w-full cursor-pointer text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

/**
 * 클릭 가능한 카드 컨테이너.
 * 내부에 버튼(예: BookmarkButton)을 포함하는 카드는 button 중첩을 피하기 위해
 * role="button" + tabIndex로 렌더링하고 Enter/Space 선택을 직접 구현해야 한다.
 * 이 로직이 StarterKitCard/FeatureCard 두 곳에서 동일하게 필요해 공통 래퍼로 추출했다.
 */
export function ClickableCard({ onSelect, children, className }: ClickableCardProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      className={className ?? DEFAULT_CLASS_NAME}
    >
      {children}
    </div>
  );
}
