import { FEATURE_CATEGORIES, type Feature, type FeatureCategory } from './types';

/**
 * 카테고리 필터 값. 'all'은 전체 표시를 의미합니다.
 */
export type FeatureCategoryFilter = FeatureCategory | 'all';

/**
 * 알 수 없는 문자열을 `FeatureCategoryFilter`로 검증합니다.
 * URL 쿼리스트링(`searchParams`)처럼 신뢰할 수 없는 입력을 좁힐 때 사용하며,
 * 허용되지 않는 값은 'all'로 폴백합니다.
 */
export function toFeatureCategoryFilter(value: string | undefined): FeatureCategoryFilter {
  if (value === undefined) {
    return 'all';
  }

  return FEATURE_CATEGORIES.includes(value as FeatureCategory) ? (value as FeatureCategory) : 'all';
}

/**
 * 선택된 카테고리 기준으로 Feature 목록을 필터링합니다.
 * 'all'이면 전체 목록을 그대로 반환합니다.
 */
export function filterFeaturesByCategory(
  features: Feature[],
  category: FeatureCategoryFilter
): Feature[] {
  if (category === 'all') {
    return features;
  }

  return features.filter((feature) => feature.category === category);
}
