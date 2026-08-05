'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { STARTER_KIT_CATEGORIES } from '../model/types';
import type { StarterKitCategoryFilter } from '../model/filter-by-category';

const CATEGORY_FILTER_OPTIONS: { value: StarterKitCategoryFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  ...STARTER_KIT_CATEGORIES.map((category) => ({ value: category, label: category })),
];

interface StarterKitCategoryFilterProps {
  selectedCategory: StarterKitCategoryFilter;
}

/**
 * 카테고리 단일 선택 칩 필터.
 * 클릭 시 URL 쿼리스트링(`?category=`)만 갱신하고, 실제 필터링은 목록 컨테이너가 담당합니다.
 */
export function StarterKitCategoryFilter({ selectedCategory }: StarterKitCategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSelect = (category: StarterKitCategoryFilter) => {
    const params = new URLSearchParams(searchParams.toString());

    if (category === 'all') {
      params.delete('category');
    } else {
      params.set('category', category);
    }

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
