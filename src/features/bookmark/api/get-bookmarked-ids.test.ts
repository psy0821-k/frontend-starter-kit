import { afterEach, describe, expect, it, vi } from 'vitest';
import { getBookmarkedIds } from './get-bookmarked-ids';

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
 * select().eq().eq()가 체이닝되다가 await 시점에 resolvedValue로 resolve된다.
 */
function createQueryBuilder(resolvedValue: { data: unknown; error: unknown }) {
  const builder: Record<string, unknown> = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    then: (resolve: (value: unknown) => void) => resolve(resolvedValue),
  };
  return builder;
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('getBookmarkedIds', () => {
  it('로그인 사용자가 특정 target_type의 북마크 2건을 가지고 있을 때 해당 target_id 2개를 담은 Set을 반환해야 한다', async () => {
    isSupabaseConfigured.mockReturnValue(true);
    from.mockReturnValue(
      createQueryBuilder({
        data: [{ target_id: 't-1' }, { target_id: 't-2' }],
        error: null,
      })
    );

    const result = await getBookmarkedIds('template', 'user-1');

    expect(result).toEqual(new Set(['t-1', 't-2']));
  });

  it('로그인 사용자가 해당 target_type의 북마크가 없을 때 빈 Set을 반환해야 한다', async () => {
    isSupabaseConfigured.mockReturnValue(true);
    from.mockReturnValue(createQueryBuilder({ data: [], error: null }));

    const result = await getBookmarkedIds('template', 'user-1');

    expect(result).toEqual(new Set());
  });

  it('userId가 null(비로그인)일 때 조회를 시도하지 않고 빈 Set을 반환해야 한다', async () => {
    isSupabaseConfigured.mockReturnValue(true);

    const result = await getBookmarkedIds('template', null);

    expect(result).toEqual(new Set());
    expect(from).not.toHaveBeenCalled();
  });

  it('Supabase가 설정되지 않았을 때 조회를 시도하지 않고 빈 Set을 반환해야 한다', async () => {
    isSupabaseConfigured.mockReturnValue(false);

    const result = await getBookmarkedIds('template', 'user-1');

    expect(result).toEqual(new Set());
    expect(from).not.toHaveBeenCalled();
  });
});
