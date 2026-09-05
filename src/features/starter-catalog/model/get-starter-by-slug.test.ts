import { describe, expect, it } from 'vitest';
import { getStarterBySlug } from './get-starter-by-slug';

describe('getStarterBySlug', () => {
  it("slug가 'portfolio'이면 포트폴리오 스타터를 반환한다", () => {
    const result = getStarterBySlug('portfolio');

    expect(result).toBeDefined();
    expect(result?.slug).toBe('portfolio');
  });

  it("slug가 'erp'이면 ERP 스타터를 반환한다", () => {
    const result = getStarterBySlug('erp');

    expect(result).toBeDefined();
    expect(result?.slug).toBe('erp');
  });

  it('카탈로그에 없는 slug이면 undefined를 반환한다', () => {
    const result = getStarterBySlug('unknown-slug');

    expect(result).toBeUndefined();
  });
});
