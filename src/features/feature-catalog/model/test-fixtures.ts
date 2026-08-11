import type { Feature } from './types';

/**
 * 테스트용 Feature 목 객체 생성 팩토리.
 * 필터링/카드 테스트에서 공유하는 fixture입니다.
 */
export function createMockFeature(overrides: Partial<Feature> = {}): Feature {
  return {
    id: 'feature-1',
    title: '제목',
    description: '설명',
    category: 'search',
    ...overrides,
  };
}
