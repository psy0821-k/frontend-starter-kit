import { StarterKitCard } from './starter-kit-card';
import type { StarterKit } from '../model/types';

interface StarterKitSectionProps {
  category: string;
  items: StarterKit[];
  onSelect: (starterKit: StarterKit) => void;
}

/**
 * 카테고리 하나에 대응하는 가로 섹션.
 * 카드 그리드는 모바일 1열 → 태블릿 2열 → 데스크톱 3열로 반응형 처리합니다.
 */
export function StarterKitSection({ category, items, onSelect }: StarterKitSectionProps) {
  return (
    <section aria-labelledby={`section-${category}`} className="flex flex-col gap-4">
      <h2 id={`section-${category}`} className="text-xl font-semibold">
        {category}
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <StarterKitCard key={item.id} starterKit={item} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
}
