import { StarterKitCardSkeleton } from '@/features/starter-kit/ui/starter-kit-card-skeleton';

const SKELETON_COUNT = 9;

/**
 * 전체 스타터 킷 목록 페이지의 로딩 상태.
 * StarterKitInfiniteList와 동일한 그리드 레이아웃으로 레이아웃 시프트를 방지합니다.
 */
export default function TemplatesLoading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold">전체 스타터 킷</h1>
        <p className="text-xl text-muted-foreground">
          검색하거나 카테고리별로 필터링하고, 스크롤하며 모든 스타터 킷을 살펴보세요
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <StarterKitCardSkeleton key={`skeleton-${index}`} />
        ))}
      </div>
    </main>
  );
}
