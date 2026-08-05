'use client';

import { useState } from 'react';
import { StarterKitSection } from './starter-kit-section';
import { StarterKitSummaryModal } from './starter-kit-summary-modal';
import { StarterKitEmptyState } from './starter-kit-empty-state';
import type { StarterKitSection as StarterKitSectionType } from '../model/group-by-category';
import type { StarterKit } from '../model/types';

interface StarterKitListProps {
  sections: StarterKitSectionType[];
}

/**
 * 카테고리별 섹션 목록과 요약 모달의 열림/닫힘 상태를 함께 관리하는 컨테이너.
 */
export function StarterKitList({ sections }: StarterKitListProps) {
  const [selectedKit, setSelectedKit] = useState<StarterKit | null>(null);

  if (sections.length === 0) {
    return <StarterKitEmptyState />;
  }

  return (
    <div className="flex flex-col gap-12">
      {sections.map((section) => (
        <StarterKitSection
          key={section.category}
          category={section.category}
          items={section.items}
          onSelect={setSelectedKit}
        />
      ))}
      <StarterKitSummaryModal
        starterKit={selectedKit}
        onOpenChange={(open) => {
          if (!open) setSelectedKit(null);
        }}
      />
    </div>
  );
}
