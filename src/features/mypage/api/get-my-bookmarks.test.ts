import { afterEach, describe, expect, it, vi } from 'vitest';
import { getMyBookmarks } from './get-my-bookmarks';

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
 * select().eq().order() / select().in()이 체이닝되다가 await 시점에
 * resolvedValue로 resolve된다.
 */
function createQueryBuilder(resolvedValue: { data: unknown; error: unknown }) {
  const builder: Record<string, unknown> = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    in: vi.fn(() => builder),
    order: vi.fn(() => builder),
    then: (resolve: (value: unknown) => void) => resolve(resolvedValue),
  };
  return builder;
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('getMyBookmarks', () => {
  it('should return items sorted by createdAt descending with type badge info when user has bookmarked 2 templates and 1 feature', async () => {
    isSupabaseConfigured.mockReturnValue(true);

    const bookmarksBuilder = createQueryBuilder({
      data: [
        {
          target_type: 'template',
          target_id: 't-1',
          created_at: '2026-08-20T00:00:00.000Z',
        },
        {
          target_type: 'template',
          target_id: 't-2',
          created_at: '2026-08-22T00:00:00.000Z',
        },
        {
          target_type: 'feature',
          target_id: 'f-1',
          created_at: '2026-08-21T00:00:00.000Z',
        },
      ],
      error: null,
    });
    const templatesBuilder = createQueryBuilder({
      data: [
        { id: 't-1', title: '템플릿 하나' },
        { id: 't-2', title: '템플릿 둘' },
      ],
      error: null,
    });
    const featuresBuilder = createQueryBuilder({
      data: [{ id: 'f-1', title: '기능 하나' }],
      error: null,
    });

    from.mockImplementation((table: string) => {
      if (table === 'bookmarks') return bookmarksBuilder;
      if (table === 'templates') return templatesBuilder;
      if (table === 'features') return featuresBuilder;
      throw new Error(`unexpected table: ${table}`);
    });

    const result = await getMyBookmarks('user-1');

    expect(result).toHaveLength(3);
    result.forEach((item) => {
      expect(item).toHaveProperty('targetType');
      expect(item).toHaveProperty('targetId');
      expect(item).toHaveProperty('title');
      expect(item).toHaveProperty('createdAt');
    });
    expect(result.map((item) => item.targetId)).toEqual(['t-2', 'f-1', 't-1']);
  });

  it('should return an empty array when user has no bookmarks', async () => {
    isSupabaseConfigured.mockReturnValue(true);
    const bookmarksBuilder = createQueryBuilder({ data: [], error: null });
    from.mockImplementation((table: string) => {
      if (table === 'bookmarks') return bookmarksBuilder;
      throw new Error(`unexpected table: ${table}`);
    });

    const result = await getMyBookmarks('user-1');

    expect(result).toEqual([]);
  });

  it('should silently exclude a bookmark whose target template has been deleted (join returns no matching template row)', async () => {
    isSupabaseConfigured.mockReturnValue(true);
    const bookmarksBuilder = createQueryBuilder({
      data: [
        {
          target_type: 'template',
          target_id: 't-deleted',
          created_at: '2026-08-20T00:00:00.000Z',
        },
      ],
      error: null,
    });
    const templatesBuilder = createQueryBuilder({ data: [], error: null });

    from.mockImplementation((table: string) => {
      if (table === 'bookmarks') return bookmarksBuilder;
      if (table === 'templates') return templatesBuilder;
      throw new Error(`unexpected table: ${table}`);
    });

    const result = await getMyBookmarks('user-1');

    expect(result).toEqual([]);
  });

  it('should return an empty array when Supabase is not configured (isSupabaseConfigured() === false)', async () => {
    isSupabaseConfigured.mockReturnValue(false);

    const result = await getMyBookmarks('user-1');

    expect(result).toEqual([]);
    expect(from).not.toHaveBeenCalled();
  });
});
