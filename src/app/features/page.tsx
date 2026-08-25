import { getFeatures } from '@/features/feature-catalog/api/get-features';
import {
  toFeatureCategoryFilter,
  filterFeaturesByCategory,
} from '@/features/feature-catalog/model/filter-by-category';
import { filterFeaturesBySearch } from '@/features/feature-catalog/model/filter-by-search';
import { paginate, toValidPage } from '@/features/feature-catalog/model/paginate';
import { FeatureCategoryFilter } from '@/features/feature-catalog/ui/feature-category-filter';
import { FeatureEmptyState } from '@/features/feature-catalog/ui/feature-empty-state';
import { FeatureFilteredEmptyState } from '@/features/feature-catalog/ui/feature-filtered-empty-state';
import { FeatureList } from '@/features/feature-catalog/ui/feature-list';
import { FeaturePagination } from '@/features/feature-catalog/ui/feature-pagination';
import { FeatureSearchInput } from '@/features/feature-catalog/ui/feature-search-input';
import { getCurrentUser } from '@/shared/api/auth/get-current-user';
import { getBookmarkedIds } from '@/features/bookmark/api/get-bookmarked-ids';

interface FeaturesPageProps {
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
}

/** 페이지 상단 제목/설명. 빈 상태와 정상 상태 양쪽에서 동일하게 노출된다. */
function FeaturesPageHeader() {
  return (
    <div className="mb-8 text-center">
      <h1 className="mb-4 text-4xl font-bold">전체 Feature</h1>
      <p className="text-xl text-muted-foreground">
        프로젝트에 자유롭게 조합할 수 있는 재사용 가능한 기능 모듈을 살펴보세요
      </p>
    </div>
  );
}

/**
 * 전체 Feature 목록 페이지.
 * 정적 데이터를 기반으로 재사용 가능한 기능 모듈을 소개합니다.
 * templates(무한스크롤)와 달리 페이지네이션을 사용합니다(정적·소량 데이터, 참조형 목록).
 */
export default async function FeaturesPage({ searchParams }: FeaturesPageProps) {
  const { category, q, page } = await searchParams;
  const selectedCategory = toFeatureCategoryFilter(category);
  const searchQuery = q ?? '';

  const [allFeatures, currentUser] = await Promise.all([getFeatures(), getCurrentUser()]);

  if (allFeatures.length === 0) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <FeaturesPageHeader />
        <FeatureEmptyState />
      </main>
    );
  }

  const bookmarkedIds = await getBookmarkedIds('feature', currentUser?.id ?? null);

  const categoryFiltered = filterFeaturesByCategory(allFeatures, selectedCategory);
  const filteredFeatures = filterFeaturesBySearch(categoryFiltered, searchQuery);

  const { items, currentPage, totalPages } = paginate(filteredFeatures, toValidPage(page));

  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <FeaturesPageHeader />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FeatureCategoryFilter selectedCategory={selectedCategory} />
        <FeatureSearchInput initialQuery={searchQuery} />
      </div>
      {items.length === 0 ? (
        <FeatureFilteredEmptyState />
      ) : (
        <>
          <FeatureList
            features={items}
            bookmarkedIds={bookmarkedIds}
            isAuthenticated={currentUser !== null}
          />
          <FeaturePagination currentPage={currentPage} totalPages={totalPages} />
        </>
      )}
    </main>
  );
}
