import { afterEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

const signUp = vi.fn();

vi.mock('@/shared/api/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(async () => ({ auth: { signUp } })),
}));

const validBody = {
  name: '홍길동',
  email: 'user@example.com',
  password: 'abc12345!',
  passwordConfirm: 'abc12345!',
  nickname: '닉네임',
  agreedToTerms: true,
  agreedToPrivacy: true,
};

function createRequest(body: unknown): Request {
  return new Request('http://localhost/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/auth/register', () => {
  it('요청 body가 registerSchema에 위배되면 400 VALIDATION_ERROR를 반환하고 Supabase를 호출하지 않는다', async () => {
    const response = await POST(createRequest({ ...validBody, agreedToTerms: false }));
    const body = (await response.json()) as { success: boolean; error: { code: string } };

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(signUp).not.toHaveBeenCalled();
  });

  it('가입에 성공하면 200과 success: true를 반환한다', async () => {
    signUp.mockResolvedValue({ error: null });

    const response = await POST(createRequest(validBody));
    const body = (await response.json()) as { success: boolean; data: null };

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeNull();
  });

  it('signUp 호출 시 options.data에 nickname/name만 포함하고 birthDate는 포함하지 않는다', async () => {
    signUp.mockResolvedValue({ error: null });

    await POST(createRequest(validBody));

    expect(signUp).toHaveBeenCalledWith({
      email: validBody.email,
      password: validBody.password,
      options: { data: { nickname: validBody.nickname, name: validBody.name } },
    });
    const [[callArg]] = signUp.mock.calls as [[{ options: { data: Record<string, unknown> } }]];
    expect(callArg.options.data).not.toHaveProperty('birthDate');
  });

  it('이미 가입된 이메일이면 CONFLICT로 매핑된 에러를 반환한다', async () => {
    signUp.mockResolvedValue({
      error: { code: 'user_already_exists', status: 422, message: 'already registered' },
    });

    const response = await POST(createRequest(validBody));
    const body = (await response.json()) as { success: boolean; error: { code: string } };

    expect(response.status).toBe(422);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('CONFLICT');
  });

  it('매핑 테이블에 없는 Supabase 에러는 500 INTERNAL_ERROR로 흡수한다', async () => {
    signUp.mockResolvedValue({
      error: { code: 'some_unknown_code', status: 400, message: 'internal db detail leaked' },
    });

    const response = await POST(createRequest(validBody));
    const body = (await response.json()) as {
      success: boolean;
      error: { code: string; message: string };
    };

    expect(response.status).toBe(500);
    expect(body.error.code).toBe('INTERNAL_ERROR');
  });
});
