import { describe, expect, it } from 'vitest';
import { filterFeaturesByCategory, toFeatureCategoryFilter } from './filter-by-category';
import { createMockFeature } from './test-fixtures';

describe('toFeatureCategoryFilter', () => {
  it('undefined이면 all을 반환한다', () => {
    expect(toFeatureCategoryFilter(undefined)).toBe('all');
  });

  it('허용된 카테고리 문자열이면 그대로 반환한다', () => {
    expect(toFeatureCategoryFilter('board')).toBe('board');
  });

  it('허용되지 않은 문자열이면 all로 폴백한다', () => {
    expect(toFeatureCategoryFilter('알수없음')).toBe('all');
  });
});

describe('filterFeaturesByCategory', () => {
  const features = [
    createMockFeature({ id: '1', category: 'search' }),
    createMockFeature({ id: '2', category: 'board' }),
    createMockFeature({ id: '3', category: 'payment' }),
  ];

  it("category가 'all'이면 전체 목록을 그대로 반환한다", () => {
    expect(filterFeaturesByCategory(features, 'all')).toEqual(features);
  });

  it('선택된 카테고리와 일치하는 Feature만 반환한다', () => {
    const result = filterFeaturesByCategory(features, 'board');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('일치하는 Feature가 없으면 빈 배열을 반환한다', () => {
    const result = filterFeaturesByCategory([createMockFeature({ category: 'search' })], 'payment');

    expect(result).toEqual([]);
  });
});
