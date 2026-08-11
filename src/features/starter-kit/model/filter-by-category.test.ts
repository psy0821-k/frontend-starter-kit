import { describe, expect, it } from 'vitest';
import { filterStarterKitsByCategory, toStarterKitCategoryFilter } from './filter-by-category';
import { createMockStarterKit } from './test-fixtures';

describe('toStarterKitCategoryFilter', () => {
  it('null이면 all을 반환한다', () => {
    expect(toStarterKitCategoryFilter(null)).toBe('all');
  });

  it('허용된 카테고리 문자열이면 그대로 반환한다', () => {
    expect(toStarterKitCategoryFilter('erp')).toBe('erp');
  });

  it('허용되지 않은 문자열이면 all로 폴백한다', () => {
    expect(toStarterKitCategoryFilter('알수없음')).toBe('all');
  });
});

describe('filterStarterKitsByCategory', () => {
  const kits = [
    createMockStarterKit({ id: '1', category: 'erp' }),
    createMockStarterKit({ id: '2', category: '포트폴리오' }),
    createMockStarterKit({ id: '3', category: '쇼핑몰' }),
  ];

  it("category가 'all'이면 전체 목록을 그대로 반환한다", () => {
    expect(filterStarterKitsByCategory(kits, 'all')).toEqual(kits);
  });

  it('선택된 카테고리와 일치하는 킷만 반환한다', () => {
    const result = filterStarterKitsByCategory(kits, '포트폴리오');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('일치하는 킷이 없으면 빈 배열을 반환한다', () => {
    const result = filterStarterKitsByCategory(
      [createMockStarterKit({ category: 'erp' })],
      '쇼핑몰'
    );

    expect(result).toEqual([]);
  });
});
