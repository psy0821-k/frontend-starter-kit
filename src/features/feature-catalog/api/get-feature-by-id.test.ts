import { afterEach, describe, expect, it, vi } from 'vitest';
import { getFeatureById } from './get-feature-by-id';

const isSupabaseConfigured = vi.fn();
const from = vi.fn();

vi.mock('@/shared/api/supabase/config', () => ({
  isSupabaseConfigured: (...args: unknown[]) => isSupabaseConfigured(...args),
}));

vi.mock('@/shared/api/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(async () => ({ from })),
}));

/**
 * Supabase의 PostgrestFilterBuilder를 흉내내는 thenable 빌더.
 * select().eq().maybeSingle()이 체이닝되다가 await 시점에 resolvedValue로 resolve된다.
 */
function createQueryBuilder(resolvedValue: { data: unknown; error: unknown }) {
  const builder: Record<string, unknown> = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    maybeSingle: vi.fn(() => Promise.resolve(resolvedValue)),
  };
  return builder;
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('getFeatureById', () => {
  it('일치하는 Feature와 feature_files가 존재할 때 files가 채워진 FeatureDetail을 반환해야 한다', async () => {
    isSupabaseConfigured.mockReturnValue(true);
    const mockFeatureFiles = [
      {
        file_path: 'src/features/search/ui/search-input.tsx',
        code: 'export {}',
        language: 'tsx',
        sort_order: 0,
      },
    ];
    const mockRow = {
      id: 'f-1',
      title: '검색',
      description: '검색 기능',
      category: 'search',
      summary: '검색 요약',
      tags: ['search'],
      tech_stack: ['Next.js'],
      usage: '사용법',
      feature_files: mockFeatureFiles,
    };
    from.mockReturnValue(createQueryBuilder({ data: mockRow, error: null }));

    const result = await getFeatureById('f-1');

    expect(result).toEqual({
      id: 'f-1',
      title: '검색',
      description: '검색 기능',
      category: 'search',
      summary: '검색 요약',
      tags: ['search'],
      tech_stack: ['Next.js'],
      usage: '사용법',
      files: mockFeatureFiles,
    });
  });

  it('Feature는 존재하지만 feature_files가 없을 때 files가 빈 배열인 FeatureDetail을 반환해야 한다', async () => {
    isSupabaseConfigured.mockReturnValue(true);
    const mockRow = {
      id: 'f-2',
      title: '게시판',
      description: '게시판 기능',
      category: 'board',
      summary: '게시판 요약',
      tags: [],
      tech_stack: [],
      usage: '사용법',
      feature_files: null,
    };
    from.mockReturnValue(createQueryBuilder({ data: mockRow, error: null }));

    const result = await getFeatureById('f-2');

    expect(result?.files).toEqual([]);
  });

  it('주어진 id와 일치하는 Feature가 없을 때 null을 반환해야 한다', async () => {
    isSupabaseConfigured.mockReturnValue(true);
    from.mockReturnValue(createQueryBuilder({ data: null, error: null }));

    const result = await getFeatureById('missing-id');

    expect(result).toBeNull();
  });

  it('Supabase 조회가 에러를 반환할 때 에러를 로깅하고 null을 반환해야 한다', async () => {
    isSupabaseConfigured.mockReturnValue(true);
    from.mockReturnValue(createQueryBuilder({ data: null, error: { message: 'db down' } }));
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const result = await getFeatureById('f-1');

    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('Supabase가 설정되지 않았을 때 조회 자체를 시도하지 않고 null을 반환해야 한다', async () => {
    isSupabaseConfigured.mockReturnValue(false);

    const result = await getFeatureById('f-1');

    expect(result).toBeNull();
    expect(from).not.toHaveBeenCalled();
  });
});
