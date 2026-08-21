'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StarterKitCard } from './starter-kit-card';
import { StarterKitCardSkeleton } from './starter-kit-card-skeleton';
import { StarterKitEmptyState } from './starter-kit-empty-state';
import { StarterKitFilteredEmptyState } from './starter-kit-filtered-empty-state';
import { filterStarterKitsByCategory } from '../model/filter-by-category';
import { filterStarterKitsBySearch } from '../model/filter-by-search';
import { useInfiniteScroll } from '../lib/use-infinite-scroll';
import type { StarterKitCategoryFilter } from '../model/filter-by-category';
import type { StarterKit } from '../model/types';

const PAGE_SIZE = 9;
const SKELETON_COUNT = 9;

interface StarterKitInfiniteListProps {
  starterKits: StarterKit[];
  selectedCategory: StarterKitCategoryFilter;
  searchQuery: string;
}

/**
 * 전체 목록 컨테이너: 검색·카테고리 필터링 + 노출 개수(9개 단위) + 무한스크롤 + 빈 상태 분기를 담당합니다.
 * 카드 클릭 시 요약 모달 없이 상세 페이지(`/templates/[id]`)로 바로 이동합니다.
 */
export function StarterKitInfiniteList({
  starterKits,
  selectedCategory,
  searchQuery,
}: StarterKitInfiniteListProps) {
  const router = useRouter();
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const categoryFilteredKits = filterStarterKitsByCategory(starterKits, selectedCategory);
  const filteredKits = filterStarterKitsBySearch(categoryFilteredKits, searchQuery);

  // 필터(카테고리·검색어)가 바뀌면 노출 개수를 초기화하고 결과를 안내합니다.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    window.scrollTo({ top: 0 });

    const categoryLabel = selectedCategory === 'all' ? '전체' : selectedCategory;
    const trimmedQuery = searchQuery.trim();
    const searchLabel = trimmedQuery === '' ? '' : `, 검색어 "${trimmedQuery}"`;
    const resultCount = filterStarterKitsBySearch(
      filterStarterKitsByCategory(starterKits, selectedCategory),
      searchQuery
    ).length;
    setStatusMessage(`${categoryLabel} 카테고리${searchLabel}, 총 ${resultCount}개의 스타터 킷`);
  }, [selectedCategory, searchQuery, starterKits]);

  const visibleKits = filteredKits.slice(0, visibleCount);
  const hasMore = visibleCount < filteredKits.length;

  const handleIntersect = () => {
    setIsLoadingMore(true);
    setStatusMessage('추가 스타터 킷을 불러오는 중입니다');

    // 시작 안내가 별도 렌더 사이클로 커밋된 뒤 완료 안내로 갱신되도록 tick을 분리한다.
    // 같은 이벤트 핸들러 안에서 곧바로 완료 문구까지 setState하면 배치 처리되어
    // 시작 문구가 스크린리더에 전달되지 않는다.
    setTimeout(() => {
      setVisibleCount((current) => {
        const next = Math.min(current + PAGE_SIZE, filteredKits.length);
        const addedCount = next - current;
        setStatusMessage(`${addedCount}개의 스타터 킷을 추가로 불러왔습니다`);
        setIsLoadingMore(false);
        return next;
      });
    }, 0);
  };

  useInfiniteScroll({ sentinelRef, onIntersect: handleIntersect, enabled: hasMore });

  if (starterKits.length === 0) {
    return <StarterKitEmptyState />;
  }

  if (filteredKits.length === 0) {
    return (
      <>
        <div role="status" aria-live="polite" className="sr-only">
          {statusMessage}
        </div>
        <StarterKitFilteredEmptyState />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div role="status" aria-live="polite" className="sr-only">
        {statusMessage}
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visibleKits.map((kit) => (
          <StarterKitCard
            key={kit.id}
            starterKit={kit}
            onSelect={(selected) => router.push(`/templates/${selected.id}`)}
          />
        ))}
        {isLoadingMore &&
          Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <StarterKitCardSkeleton key={`skeleton-${index}`} />
          ))}
      </div>
      {hasMore && <div ref={sentinelRef} />}
    </div>
  );
}
