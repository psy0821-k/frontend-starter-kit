import { afterEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

const maybeSingle = vi.fn();
const eq = vi.fn(() => ({ maybeSingle }));
const select = vi.fn(() => ({ eq }));
const from = vi.fn(() => ({ select }));

vi.mock('@/shared/api/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(async () => ({ from })),
}));

function createRequest(body: unknown): Request {
  return new Request('http://localhost/api/auth/check-nickname', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/auth/check-nickname', () => {
  it('닉네임 형식이 유효하지 않으면 400 VALIDATION_ERROR를 반환한다', async () => {
    const response = await POST(createRequest({ nickname: 'a' }));
    const body = (await response.json()) as { success: boolean; error: { code: string } };

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(from).not.toHaveBeenCalled();
  });

  it('동일 닉네임 row가 존재하면 available: false를 반환한다', async () => {
    maybeSingle.mockResolvedValue({ data: { nickname: 'taken' }, error: null });

    const response = await POST(createRequest({ nickname: 'taken' }));
    const body = (await response.json()) as { success: boolean; data: { available: boolean } };

    expect(response.status).toBe(200);
    expect(body.data.available).toBe(false);
  });

  it('동일 닉네임 row가 없으면 available: true를 반환한다', async () => {
    maybeSingle.mockResolvedValue({ data: null, error: null });

    const response = await POST(createRequest({ nickname: 'fresh' }));
    const body = (await response.json()) as { success: boolean; data: { available: boolean } };

    expect(response.status).toBe(200);
    expect(body.data.available).toBe(true);
  });

  it('Supabase 조회가 에러를 반환하면 500 INTERNAL_ERROR로 흡수하고 원본 메시지를 노출하지 않는다', async () => {
    maybeSingle.mockResolvedValue({
      data: null,
      error: { message: 'db connection refused at 10.0.0.1' },
    });

    const response = await POST(createRequest({ nickname: 'fresh' }));
    const body = (await response.json()) as {
      success: boolean;
      error: { code: string; message: string };
    };

    expect(response.status).toBe(500);
    expect(body.error.code).toBe('INTERNAL_ERROR');
    expect(body.error.message).not.toContain('10.0.0.1');
  });
});
