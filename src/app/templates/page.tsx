import { getStarterKits } from '@/features/starter-kit/api/get-starter-kits';
import { toStarterKitCategoryFilter } from '@/features/starter-kit/model/filter-by-category';
import { StarterKitCategoryFilter } from '@/features/starter-kit/ui/starter-kit-category-filter';
import { StarterKitInfiniteList } from '@/features/starter-kit/ui/starter-kit-infinite-list';
import { StarterKitSearchInput } from '@/features/starter-kit/ui/starter-kit-search-input';

interface TemplatesPageProps {
  searchParams: Promise<{ category?: string; q?: string }>;
}

/**
 * 전체 스타터 킷 목록 페이지.
 * 검색·카테고리 필터와 무한스크롤로 등록된 모든 스타터 킷을 탐색할 수 있습니다.
 */
export default async function TemplatesPage({ searchParams }: TemplatesPageProps) {
  const { category, q } = await searchParams;
  const selectedCategory = toStarterKitCategoryFilter(category ?? null);
  const searchQuery = q ?? '';

  const starterKits = await getStarterKits();
  const sortedStarterKits = [...starterKits].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold">전체 스타터 킷</h1>
        <p className="text-xl text-muted-foreground">
          검색하거나 카테고리별로 필터링하고, 스크롤하며 모든 스타터 킷을 살펴보세요
        </p>
      </div>
      <div className="mb-6 sticky top-0 z-10 flex flex-col gap-3 border-b border-border bg-background py-2 sm:flex-row sm:items-center sm:justify-between">
        <StarterKitCategoryFilter selectedCategory={selectedCategory} />
        <StarterKitSearchInput initialQuery={searchQuery} />
      </div>
      <StarterKitInfiniteList
        starterKits={sortedStarterKits}
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
      />
    </main>
  );
}
