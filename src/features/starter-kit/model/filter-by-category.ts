import { STARTER_KIT_CATEGORIES, type StarterKit, type StarterKitCategory } from './types';

/**
 * 카테고리 필터 값. 'all'은 전체 표시를 의미합니다.
 */
export type StarterKitCategoryFilter = StarterKitCategory | 'all';

/**
 * 알 수 없는 문자열을 `StarterKitCategoryFilter`로 검증합니다.
 * URL 쿼리스트링(`useSearchParams()`가 반환하는 `string | null`)처럼
 * 신뢰할 수 없는 입력을 좁힐 때 사용하며, 허용되지 않는 값은 'all'로 폴백합니다.
 */
export function toStarterKitCategoryFilter(value: string | null): StarterKitCategoryFilter {
  if (value === null) {
    return 'all';
  }

  return STARTER_KIT_CATEGORIES.includes(value as StarterKitCategory)
    ? (value as StarterKitCategory)
    : 'all';
}

/**
 * 선택된 카테고리 기준으로 스타터 킷 목록을 필터링합니다.
 * 'all'이면 전체 목록을 그대로 반환합니다.
 */
export function filterStarterKitsByCategory(
  kits: StarterKit[],
  category: StarterKitCategoryFilter
): StarterKit[] {
  if (category === 'all') {
    return kits;
  }

  return kits.filter((kit) => kit.category === category);
}
