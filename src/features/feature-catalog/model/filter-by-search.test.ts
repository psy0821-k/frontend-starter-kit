import { describe, expect, it } from 'vitest';
import { filterFeaturesBySearch } from './filter-by-search';
import { createMockFeature } from './test-fixtures';

describe('filterFeaturesBySearch', () => {
  const features = [
    createMockFeature({ id: '1', title: '검색', description: '통합 검색 기능입니다.' }),
    createMockFeature({ id: '2', title: '게시판', description: '글 작성 기능입니다.' }),
    createMockFeature({ id: '3', title: '결제', description: 'PG사와 연동하는 기능입니다.' }),
  ];

  it('검색어가 빈 문자열이면 전체 목록을 그대로 반환한다', () => {
    expect(filterFeaturesBySearch(features, '')).toEqual(features);
  });

  it('검색어가 공백만 있으면 전체 목록을 그대로 반환한다', () => {
    expect(filterFeaturesBySearch(features, '   ')).toEqual(features);
  });

  it('제목에 검색어가 포함된 Feature를 반환한다', () => {
    const result = filterFeaturesBySearch(features, '게시판');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('설명에 검색어가 포함된 Feature를 반환한다', () => {
    const result = filterFeaturesBySearch(features, 'PG사');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  it('대소문자를 구분하지 않는다', () => {
    const result = filterFeaturesBySearch(features, 'PG사'.toLowerCase());

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  it('일치하는 Feature가 없으면 빈 배열을 반환한다', () => {
    expect(filterFeaturesBySearch(features, '존재하지않는검색어')).toEqual([]);
  });
});
