import { describe, expect, it } from 'vitest';
import { filterStarterKitsBySearch } from './filter-by-search';
import { createMockStarterKit } from './test-fixtures';

describe('filterStarterKitsBySearch', () => {
  const kits = [
    createMockStarterKit({ id: '1', title: 'ERP 대시보드', tags: ['관리자'] }),
    createMockStarterKit({ id: '2', title: '포트폴리오 랜딩', tags: ['Next.js', 'Portfolio'] }),
    createMockStarterKit({ id: '3', title: '쇼핑몰 상세', tags: ['커머스'] }),
  ];

  it('검색어가 빈 문자열이면 전체 목록을 그대로 반환한다', () => {
    expect(filterStarterKitsBySearch(kits, '')).toEqual(kits);
  });

  it('검색어가 공백만 있으면 전체 목록을 그대로 반환한다', () => {
    expect(filterStarterKitsBySearch(kits, '   ')).toEqual(kits);
  });

  it('제목에 검색어가 포함된 킷을 반환한다', () => {
    const result = filterStarterKitsBySearch(kits, '랜딩');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('태그에 검색어가 포함된 킷을 반환한다', () => {
    const result = filterStarterKitsBySearch(kits, '커머스');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  it('대소문자를 구분하지 않는다', () => {
    const result = filterStarterKitsBySearch(kits, 'PORTFOLIO');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('일치하는 킷이 없으면 빈 배열을 반환한다', () => {
    expect(filterStarterKitsBySearch(kits, '존재하지않는검색어')).toEqual([]);
  });
});
