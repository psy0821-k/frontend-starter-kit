import type { Feature } from './types';

/**
 * 검색어로 Feature 목록을 필터링합니다.
 * 이름(title) 또는 설명(description)에 검색어가 포함되면(대소문자 무시) 매칭됩니다.
 * 검색어가 공백뿐이면 전체 목록을 그대로 반환합니다.
 */
export function filterFeaturesBySearch(features: Feature[], query: string): Feature[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery === '') {
    return features;
  }

  return features.filter((feature) => {
    const titleMatches = feature.title.toLowerCase().includes(normalizedQuery);
    const descriptionMatches = feature.description.toLowerCase().includes(normalizedQuery);

    return titleMatches || descriptionMatches;
  });
}
