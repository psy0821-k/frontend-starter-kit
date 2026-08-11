import { SearchX } from 'lucide-react';

/**
 * 카테고리 필터 또는 검색 결과가 0개일 때 보여주는 빈 상태 UI.
 * `StarterKitFilteredEmptyState`와 동일한 패턴입니다.
 */
export function FeatureFilteredEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <SearchX className="size-10 text-muted-foreground" aria-hidden="true" />
      <p className="text-base font-medium">조건에 맞는 Feature가 없습니다</p>
      <p className="text-sm text-muted-foreground">
        다른 카테고리를 선택하거나 검색어를 변경해보세요.
      </p>
    </div>
  );
}
