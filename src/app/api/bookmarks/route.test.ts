import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET, POST, DELETE } from './route';

const getCurrentUser = vi.fn();

/**
 * Supabase의 PostgrestFilterBuilder를 흉내내는 thenable 빌더.
 * 실제 supabase-js는 .select()/.eq()/.insert()/.delete()가 계속 빌더 자신을 반환하고,
 * 그 빌더가 thenable이라 await 시점에 마지막으로 설정된 resolvedValue로 resolve된다.
 * .maybeSingle()만 예외적으로 즉시 Promise를 반환한다(단건 종결 메서드).
 */
function createQueryBuilder(resolvedValue: { data?: unknown; count?: number; error: unknown }) {
  const builder: Record<string, unknown> = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    delete: vi.fn(() => builder),
    maybeSingle: vi.fn(async () => ({
      data: resolvedValue.data ?? null,
      error: resolvedValue.error,
    })),
    then: (resolve: (value: unknown) => void) => resolve(resolvedValue),
  };
  return builder;
}

const from = vi.fn();

vi.mock('@/shared/api/auth/get-current-user', () => ({
  getCurrentUser: (...args: unknown[]) => getCurrentUser(...args),
}));

vi.mock('@/shared/api/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(async () => ({ from })),
}));

vi.mock('@/features/feature-catalog/model/data', () => ({
  FEATURES: [{ id: 'search', title: 'Search', description: '', category: 'search' }],
}));

function createRequest(url: string, method: string, body?: unknown): Request {
  return new Request(url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * table별로 응답을 다르게 주는 from mock을 구성한다.
 * templates: 존재 확인용 maybeSingle 결과
 * bookmarks: count 조회(select 체인 종료) + 단건 조회(maybeSingle) + insert/delete 결과
 */
function mockSupabaseTables(options: {
  templateExists?: boolean;
  bookmarkExists?: boolean;
  count?: number;
  insertError?: { code: string; message: string } | null;
  deleteError?: { code: string; message: string } | null;
}) {
  const {
    templateExists = true,
    bookmarkExists = false,
    count = 0,
    insertError = null,
    deleteError = null,
  } = options;

  from.mockImplementation((table: string) => {
    if (table === 'templates') {
      return createQueryBuilder({ data: templateExists ? { id: 'tpl' } : null, error: null });
    }

    // bookmarks 테이블: select().eq()...(count 응답 또는 maybeSingle 응답), delete().eq().eq()
    // (삭제 응답)가 각각 다른 진입점(select/delete)에서 시작되므로, 어느 메서드로 체인이
    // 시작됐는지에 따라 다른 종결 형태로 resolve되도록 구성한다.
    let isDeleteChain = false;

    const builder: Record<string, unknown> = {
      select: vi.fn(() => builder),
      eq: vi.fn(() => builder),
      insert: vi.fn(() => ({ error: insertError })),
      delete: vi.fn(() => {
        isDeleteChain = true;
        return builder;
      }),
      maybeSingle: vi.fn(async () => ({
        data: bookmarkExists ? { id: 'bm-1' } : null,
        error: null,
      })),
      then: (resolve: (value: unknown) => void) => {
        if (isDeleteChain) {
          resolve({ error: deleteError });
          return;
        }
        resolve({ count, error: null });
      },
    };
    return builder;
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/bookmarks', () => {
  it('로그인 사용자가 북마크한 target을 조회하면 isBookmarked:true와 count를 반환한다', async () => {
    getCurrentUser.mockResolvedValue({ id: 'user-1', nickname: 'tester' });
    mockSupabaseTables({ bookmarkExists: true, count: 5 });

    const request = createRequest(
      'http://localhost/api/bookmarks?targetType=template&targetId=11111111-1111-1111-1111-111111111111',
      'GET'
    );
    const response = await GET(request);
    const body = (await response.json()) as {
      success: boolean;
      data: { isBookmarked: boolean; count: number };
    };

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.isBookmarked).toBe(true);
    expect(body.data.count).toBe(5);
  });

  it('로그인 사용자가 북마크하지 않은 target을 조회하면 isBookmarked:false를 반환한다', async () => {
    getCurrentUser.mockResolvedValue({ id: 'user-1', nickname: 'tester' });
    mockSupabaseTables({ bookmarkExists: false, count: 2 });

    const request = createRequest(
      'http://localhost/api/bookmarks?targetType=template&targetId=11111111-1111-1111-1111-111111111111',
      'GET'
    );
    const response = await GET(request);
    const body = (await response.json()) as { success: boolean; data: { isBookmarked: boolean } };

    expect(response.status).toBe(200);
    expect(body.data.isBookmarked).toBe(false);
  });

  it('비로그인 상태로 조회하면 isBookmarked:false와 공개 count를 반환한다', async () => {
    getCurrentUser.mockResolvedValue(null);
    mockSupabaseTables({ count: 3 });

    const request = createRequest(
      'http://localhost/api/bookmarks?targetType=template&targetId=11111111-1111-1111-1111-111111111111',
      'GET'
    );
    const response = await GET(request);
    const body = (await response.json()) as {
      success: boolean;
      data: { isBookmarked: boolean; count: number };
    };

    expect(response.status).toBe(200);
    expect(body.data.isBookmarked).toBe(false);
    expect(body.data.count).toBe(3);
  });

  it('북마크가 전혀 없는 target을 조회하면 count:0을 반환한다', async () => {
    getCurrentUser.mockResolvedValue(null);
    mockSupabaseTables({ count: 0 });

    const request = createRequest(
      'http://localhost/api/bookmarks?targetType=feature&targetId=search',
      'GET'
    );
    const response = await GET(request);
    const body = (await response.json()) as { success: boolean; data: { count: number } };

    expect(response.status).toBe(200);
    expect(body.data.count).toBe(0);
  });

  it('targetType이 유효하지 않으면 400 VALIDATION_ERROR를 반환한다', async () => {
    const request = createRequest(
      'http://localhost/api/bookmarks?targetType=invalid&targetId=abc',
      'GET'
    );
    const response = await GET(request);
    const body = (await response.json()) as { success: boolean; error: { code: string } };

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('targetType이 feature이고 정적 목록에 없는 targetId면 400 VALIDATION_ERROR를 반환한다', async () => {
    const request = createRequest(
      'http://localhost/api/bookmarks?targetType=feature&targetId=nonexistent',
      'GET'
    );
    const response = await GET(request);
    const body = (await response.json()) as { success: boolean; error: { code: string } };

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('targetType이 template이고 templates 테이블에 존재하지 않는 targetId면 404 NOT_FOUND를 반환한다', async () => {
    getCurrentUser.mockResolvedValue(null);
    mockSupabaseTables({ templateExists: false });

    const request = createRequest(
      'http://localhost/api/bookmarks?targetType=template&targetId=99999999-9999-9999-9999-999999999999',
      'GET'
    );
    const response = await GET(request);
    const body = (await response.json()) as { success: boolean; error: { code: string } };

    expect(response.status).toBe(404);
    expect(body.error.code).toBe('NOT_FOUND');
  });
});

describe('POST /api/bookmarks', () => {
  it('아직 북마크하지 않은 target에 대해 요청하면 삽입 후 isBookmarked:true와 count+1을 반환한다', async () => {
    getCurrentUser.mockResolvedValue({ id: 'user-1', nickname: 'tester' });
    mockSupabaseTables({ templateExists: true, bookmarkExists: true, count: 1, insertError: null });

    const request = createRequest('http://localhost/api/bookmarks', 'POST', {
      targetType: 'template',
      targetId: '11111111-1111-1111-1111-111111111111',
    });
    const response = await POST(request);
    const body = (await response.json()) as {
      success: boolean;
      data: { isBookmarked: boolean; count: number };
    };

    expect(response.status).toBe(200);
    expect(body.data.isBookmarked).toBe(true);
    expect(body.data.count).toBe(1);
  });

  it('비로그인 상태로 요청하면 401 AUTH_REQUIRED를 반환한다', async () => {
    getCurrentUser.mockResolvedValue(null);

    const request = createRequest('http://localhost/api/bookmarks', 'POST', {
      targetType: 'template',
      targetId: '11111111-1111-1111-1111-111111111111',
    });
    const response = await POST(request);
    const body = (await response.json()) as { success: boolean; error: { code: string } };

    expect(response.status).toBe(401);
    expect(body.error.code).toBe('AUTH_REQUIRED');
  });

  it('이미 북마크된 target에 재요청해도(unique_violation) 에러가 아니라 현재 상태를 200으로 반환한다', async () => {
    getCurrentUser.mockResolvedValue({ id: 'user-1', nickname: 'tester' });
    mockSupabaseTables({
      templateExists: true,
      bookmarkExists: true,
      count: 4,
      insertError: { code: '23505', message: 'duplicate key' },
    });

    const request = createRequest('http://localhost/api/bookmarks', 'POST', {
      targetType: 'template',
      targetId: '11111111-1111-1111-1111-111111111111',
    });
    const response = await POST(request);
    const body = (await response.json()) as {
      success: boolean;
      data: { isBookmarked: boolean; count: number };
    };

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.isBookmarked).toBe(true);
  });

  it('targetType이 유효하지 않으면 400 VALIDATION_ERROR를 반환한다', async () => {
    getCurrentUser.mockResolvedValue({ id: 'user-1', nickname: 'tester' });

    const request = createRequest('http://localhost/api/bookmarks', 'POST', {
      targetType: 'invalid',
      targetId: 'abc',
    });
    const response = await POST(request);
    const body = (await response.json()) as { success: boolean; error: { code: string } };

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('targetType이 feature이고 정적 목록에 없는 targetId면 400 VALIDATION_ERROR를 반환한다', async () => {
    getCurrentUser.mockResolvedValue({ id: 'user-1', nickname: 'tester' });

    const request = createRequest('http://localhost/api/bookmarks', 'POST', {
      targetType: 'feature',
      targetId: 'nonexistent',
    });
    const response = await POST(request);
    const body = (await response.json()) as { success: boolean; error: { code: string } };

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('targetType이 template이고 templates 테이블에 존재하지 않는 targetId면 404 NOT_FOUND를 반환한다', async () => {
    getCurrentUser.mockResolvedValue({ id: 'user-1', nickname: 'tester' });
    mockSupabaseTables({ templateExists: false });

    const request = createRequest('http://localhost/api/bookmarks', 'POST', {
      targetType: 'template',
      targetId: '99999999-9999-9999-9999-999999999999',
    });
    const response = await POST(request);
    const body = (await response.json()) as { success: boolean; error: { code: string } };

    expect(response.status).toBe(404);
    expect(body.error.code).toBe('NOT_FOUND');
  });

  it('unique_violation이 아닌 삽입 실패는 502 UPSTREAM_ERROR를 반환한다', async () => {
    getCurrentUser.mockResolvedValue({ id: 'user-1', nickname: 'tester' });
    mockSupabaseTables({
      templateExists: true,
      insertError: { code: '55000', message: 'db down' },
    });

    const request = createRequest('http://localhost/api/bookmarks', 'POST', {
      targetType: 'template',
      targetId: '11111111-1111-1111-1111-111111111111',
    });
    const response = await POST(request);
    const body = (await response.json()) as { success: boolean; error: { code: string } };

    expect(response.status).toBe(502);
    expect(body.error.code).toBe('UPSTREAM_ERROR');
  });
});

describe('DELETE /api/bookmarks', () => {
  it('북마크된 target을 삭제 요청하면 isBookmarked:false와 count-1을 반환한다', async () => {
    getCurrentUser.mockResolvedValue({ id: 'user-1', nickname: 'tester' });
    mockSupabaseTables({ bookmarkExists: false, count: 3, deleteError: null });

    const request = createRequest(
      'http://localhost/api/bookmarks?targetType=template&targetId=11111111-1111-1111-1111-111111111111',
      'DELETE'
    );
    const response = await DELETE(request);
    const body = (await response.json()) as {
      success: boolean;
      data: { isBookmarked: boolean; count: number };
    };

    expect(response.status).toBe(200);
    expect(body.data.isBookmarked).toBe(false);
    expect(body.data.count).toBe(3);
  });

  it('비로그인 상태로 요청하면 401 AUTH_REQUIRED를 반환한다', async () => {
    getCurrentUser.mockResolvedValue(null);

    const request = createRequest(
      'http://localhost/api/bookmarks?targetType=template&targetId=11111111-1111-1111-1111-111111111111',
      'DELETE'
    );
    const response = await DELETE(request);
    const body = (await response.json()) as { success: boolean; error: { code: string } };

    expect(response.status).toBe(401);
    expect(body.error.code).toBe('AUTH_REQUIRED');
  });

  it('이미 북마크가 없는 target에 재요청해도 에러가 아니라 현재 상태를 200으로 반환한다', async () => {
    getCurrentUser.mockResolvedValue({ id: 'user-1', nickname: 'tester' });
    mockSupabaseTables({ bookmarkExists: false, count: 0, deleteError: null });

    const request = createRequest(
      'http://localhost/api/bookmarks?targetType=template&targetId=11111111-1111-1111-1111-111111111111',
      'DELETE'
    );
    const response = await DELETE(request);
    const body = (await response.json()) as {
      success: boolean;
      data: { isBookmarked: boolean; count: number };
    };

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.isBookmarked).toBe(false);
  });

  it('targetType이 유효하지 않으면 400 VALIDATION_ERROR를 반환한다', async () => {
    getCurrentUser.mockResolvedValue({ id: 'user-1', nickname: 'tester' });

    const request = createRequest(
      'http://localhost/api/bookmarks?targetType=invalid&targetId=abc',
      'DELETE'
    );
    const response = await DELETE(request);
    const body = (await response.json()) as { success: boolean; error: { code: string } };

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });
});
