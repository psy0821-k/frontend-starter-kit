import { describe, expect, it } from 'vitest';
import { paginate, toValidPage } from './paginate';
import { createMockFeature } from './test-fixtures';

describe('toValidPage', () => {
  it('undefined이면 1을 반환한다', () => {
    expect(toValidPage(undefined)).toBe(1);
  });

  it('숫자가 아니면 1을 반환한다', () => {
    expect(toValidPage('abc')).toBe(1);
  });

  it('1보다 작으면 1을 반환한다', () => {
    expect(toValidPage('0')).toBe(1);
    expect(toValidPage('-1')).toBe(1);
  });

  it('유효한 숫자면 그대로 반환한다', () => {
    expect(toValidPage('2')).toBe(2);
    expect(toValidPage('99')).toBe(99);
  });
});

describe('paginate', () => {
  const features = Array.from({ length: 8 }, (_, index) =>
    createMockFeature({ id: `${index + 1}` })
  );

  it('1페이지는 앞의 6개를 반환한다', () => {
    const result = paginate(features, 1);

    expect(result.items).toHaveLength(6);
    expect(result.items[0].id).toBe('1');
    expect(result.items[5].id).toBe('6');
    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(2);
  });

  it('2페이지는 나머지 2개를 반환한다', () => {
    const result = paginate(features, 2);

    expect(result.items).toHaveLength(2);
    expect(result.items[0].id).toBe('7');
    expect(result.currentPage).toBe(2);
  });

  it('빈 목록이면 totalPages는 1이고 items는 빈 배열이다', () => {
    const result = paginate([], 1);

    expect(result.items).toEqual([]);
    expect(result.totalPages).toBe(1);
    expect(result.currentPage).toBe(1);
  });

  it('page가 totalPages를 넘으면 마지막 페이지로 보정한다', () => {
    const result = paginate(features, 99);

    expect(result.currentPage).toBe(2);
  });
});
