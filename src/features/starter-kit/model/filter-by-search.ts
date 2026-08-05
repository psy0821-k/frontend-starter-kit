import type { StarterKit } from './types';

/**
 * 검색어로 스타터 킷 목록을 필터링합니다.
 * 제목(title) 또는 태그(tags[])에 검색어가 포함되면(대소문자 무시) 매칭됩니다.
 * 검색어가 공백뿐이면 전체 목록을 그대로 반환합니다.
 */
export function filterStarterKitsBySearch(kits: StarterKit[], query: string): StarterKit[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery === '') {
    return kits;
  }

  return kits.filter((kit) => {
    const titleMatches = kit.title.toLowerCase().includes(normalizedQuery);
    const tagMatches = kit.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));

    return titleMatches || tagMatches;
  });
}
