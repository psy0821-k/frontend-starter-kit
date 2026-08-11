import type { StarterKit } from './types';

/**
 * 테스트용 StarterKit 목 객체 생성 팩토리.
 * 필터링/카드 테스트에서 공유하는 fixture입니다.
 */
export function createMockStarterKit(overrides: Partial<StarterKit> = {}): StarterKit {
  return {
    id: 'id-1',
    title: '제목',
    summary: '요약',
    category: '포트폴리오',
    tags: [],
    thumbnail_url: '',
    description: '',
    features: [],
    tech_stack: [],
    preview_images: [],
    author_id: 'author-1',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}
