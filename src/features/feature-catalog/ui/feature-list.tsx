'use client';

import { useRouter } from 'next/navigation';
import type { Feature } from '../model/types';
import { FeatureCard } from './feature-card';

interface FeatureListProps {
  features: Feature[];
  bookmarkedIds: Set<string>;
  isAuthenticated: boolean;
}

/** Feature 카드 그리드. 카드 선택 시 상세 페이지(`/features/[id]`)로 이동합니다. */
export function FeatureList({ features, bookmarkedIds, isAuthenticated }: FeatureListProps) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((feature) => (
        <FeatureCard
          key={feature.id}
          feature={feature}
          onSelect={(selected) => router.push(`/features/${selected.id}`)}
          isBookmarked={bookmarkedIds.has(feature.id)}
          isAuthenticated={isAuthenticated}
        />
      ))}
    </div>
  );
}
