import { STARTER_KIT_CATEGORIES, type StarterKit } from './types';

const MAX_ITEMS_PER_SECTION = 6;

export interface StarterKitSection {
  category: StarterKit['category'];
  items: StarterKit[];
}

/**
 * 카테고리별로 최신순 정렬 후 상위 N개만 남긴 섹션 목록을 만듭니다.
 * 등록된 킷이 없는 카테고리는 결과에서 제외합니다.
 */
export function groupStarterKitsByCategory(kits: StarterKit[]): StarterKitSection[] {
  return STARTER_KIT_CATEGORIES.map((category) => {
    const items = kits
      .filter((kit) => kit.category === category)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, MAX_ITEMS_PER_SECTION);

    return { category, items };
  }).filter((section) => section.items.length > 0);
}
