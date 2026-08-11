'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FEATURE_CATEGORIES } from '../model/types';
import type { FeatureCategoryFilter } from '../model/filter-by-category';

const CATEGORY_FILTER_OPTIONS: { value: FeatureCategoryFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  ...FEATURE_CATEGORIES.map((category) => ({ value: category, label: category })),
];

interface FeatureCategoryFilterProps {
  selectedCategory: FeatureCategoryFilter;
}

/**
 * 카테고리 단일 선택 칩 필터.
 * 클릭 시 URL 쿼리스트링(`?category=`)만 갱신하고, 실제 필터링은 페이지(서버 컴포넌트)가 담당합니다.
 * 카테고리 변경 시 페이지네이션은 1페이지로 리셋됩니다(`?page` 제거).
 */
export function FeatureCategoryFilter({ selectedCategory }: FeatureCategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSelect = (category: FeatureCategoryFilter) => {
    const params = new URLSearchParams(searchParams.toString());

    if (category === 'all') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    params.delete('page');

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <div role="group" aria-label="카테고리 필터" className="flex gap-2 overflow-x-auto pb-1">
      {CATEGORY_FILTER_OPTIONS.map((option) => {
        const isSelected = option.value === selectedCategory;

        return (
          <Button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
            variant={isSelected ? 'default' : 'outline'}
            size="sm"
            className="shrink-0 cursor-pointer rounded-full"
            onClick={() => handleSelect(option.value)}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
