import { afterEach, describe, expect, it, vi } from 'vitest';
import { getFeatures } from './get-features';

const isSupabaseConfigured = vi.fn();
const from = vi.fn();

vi.mock('@/shared/api/supabase/config', () => ({
  isSupabaseConfigured: (...args: unknown[]) => isSupabaseConfigured(...args),
}));

vi.mock('@/shared/api/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(async () => ({ from })),
}));

/**
 * unstable_cache는 Next.js 요청 컨텍스트(incrementalCache)가 있어야 동작한다.
 * Vitest 환경에는 이 컨텍스트가 없으므로, 캐싱 없이 콜백을 그대로 호출하도록 대체한다.
 */
vi.mock('next/cache', () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));

/**
 * Supabase의 PostgrestFilterBuilder를 흉내내는 thenable 빌더.
 * select().order()가 체이닝되다가 await 시점에 resolvedValue로 resolve된다.
 */
function createQueryBuilder(resolvedValue: { data: unknown; error: unknown }) {
  const builder: Record<string, unknown> = {
    select: vi.fn(() => builder),
    order: vi.fn(() => builder),
    then: (resolve: (value: unknown) => void) => resolve(resolvedValue),
  };
  return builder;
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('getFeatures', () => {
  it('Supabase가 정상 연결되고 데이터가 있을 때 Feature 배열을 반환해야 한다', async () => {
    isSupabaseConfigured.mockReturnValue(true);
    const mockFeatures = [
      { id: 'f-1', title: '검색', description: '검색 기능', category: 'search' },
      { id: 'f-2', title: '게시판', description: '게시판 기능', category: 'board' },
    ];
    from.mockReturnValue(createQueryBuilder({ data: mockFeatures, error: null }));

    const result = await getFeatures();

    expect(result).toEqual(mockFeatures);
  });

  it('조회 성공 시 id/title/description/category 필드만 선택해야 한다', async () => {
    isSupabaseConfigured.mockReturnValue(true);
    const builder = createQueryBuilder({ data: [], error: null });
    from.mockReturnValue(builder);

    await getFeatures();

    expect(from).toHaveBeenCalledWith('features');
    expect(builder.select).toHaveBeenCalledWith('id, title, description, category');
  });

  it('Supabase가 설정되지 않았을 때 빈 배열을 반환해야 한다', async () => {
    isSupabaseConfigured.mockReturnValue(false);

    const result = await getFeatures();

    expect(result).toEqual([]);
    expect(from).not.toHaveBeenCalled();
  });

  it('실제로 등록된 Feature가 0건일 때 빈 배열을 반환해야 한다', async () => {
    isSupabaseConfigured.mockReturnValue(true);
    from.mockReturnValue(createQueryBuilder({ data: [], error: null }));

    const result = await getFeatures();

    expect(result).toEqual([]);
  });

  it('Supabase 조회가 에러를 반환할 때 예외를 던지지 않고 빈 배열을 반환해야 한다', async () => {
    isSupabaseConfigured.mockReturnValue(true);
    from.mockReturnValue(createQueryBuilder({ data: null, error: { message: 'db down' } }));
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const result = await getFeatures();

    expect(result).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
