import { afterEach, describe, expect, it, vi } from 'vitest';
import { DELETE } from './route';

const getCurrentUser = vi.fn();
const deleteUser = vi.fn();

vi.mock('@/shared/api/auth/get-current-user', () => ({
  getCurrentUser: (...args: unknown[]) => getCurrentUser(...args),
}));

vi.mock('@/shared/api/supabase/admin', () => ({
  createSupabaseAdminClient: vi.fn(() => ({
    auth: { admin: { deleteUser } },
  })),
}));

function createRequest(body?: unknown): Request {
  return new Request('http://localhost/api/mypage/withdraw', {
    method: 'DELETE',
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('DELETE /api/mypage/withdraw', () => {
  it('로그인한 사용자가 요청하면 세션에서 추출한 user id로 admin.deleteUser를 호출하고 { success: true, data: null }을 반환해야 한다', async () => {
    getCurrentUser.mockResolvedValue({ id: 'user-1', nickname: 'nick' });
    deleteUser.mockResolvedValue({ error: null });

    const response = await DELETE(createRequest());
    const body = (await response.json()) as { success: boolean; data: null };

    expect(deleteUser).toHaveBeenCalledWith('user-1');
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeNull();
  });

  it('admin.deleteUser가 올바른 user id로 호출됐는지 검증한다 (탈퇴 완료 후 재로그인 실패는 통합/E2E 범위)', async () => {
    getCurrentUser.mockResolvedValue({ id: 'user-42', nickname: 'nick' });
    deleteUser.mockResolvedValue({ error: null });

    await DELETE(createRequest());

    expect(deleteUser).toHaveBeenCalledWith('user-42');
    expect(deleteUser).toHaveBeenCalledTimes(1);
  });

  it('요청 body에 다른 사용자의 id를 실어 보내도 서버는 body를 파싱하지 않고 세션에서 추출한 user id만 사용해야 한다', async () => {
    getCurrentUser.mockResolvedValue({ id: 'user-1', nickname: 'nick' });
    deleteUser.mockResolvedValue({ error: null });

    const response = await DELETE(createRequest({ userId: 'other-user' }));
    const body = (await response.json()) as { success: boolean };

    expect(deleteUser).toHaveBeenCalledWith('user-1');
    expect(deleteUser).not.toHaveBeenCalledWith('other-user');
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it('비로그인 상태로 요청하면 401 AUTH_REQUIRED를 반환해야 한다', async () => {
    getCurrentUser.mockResolvedValue(null);

    const response = await DELETE(createRequest());
    const body = (await response.json()) as { success: boolean; error: { code: string } };

    expect(response.status).toBe(401);
    expect(body.error.code).toBe('AUTH_REQUIRED');
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it('SUPABASE_SERVICE_ROLE_KEY가 설정되지 않은 상태로 요청하면 500 INTERNAL_ERROR를 반환해야 한다', async () => {
    getCurrentUser.mockResolvedValue({ id: 'user-1', nickname: 'nick' });

    const adminModule = await import('@/shared/api/supabase/admin');
    vi.mocked(adminModule.createSupabaseAdminClient).mockImplementationOnce(() => {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다');
    });

    const response = await DELETE(createRequest());
    const body = (await response.json()) as { success: boolean; error: { code: string } };

    expect(response.status).toBe(500);
    expect(body.error.code).toBe('INTERNAL_ERROR');
  });

  it('admin.deleteUser 호출 자체가 실패하면 502 UPSTREAM_ERROR를 반환해야 한다', async () => {
    getCurrentUser.mockResolvedValue({ id: 'user-1', nickname: 'nick' });
    deleteUser.mockResolvedValue({ error: { message: 'supabase auth error' } });

    const response = await DELETE(createRequest());
    const body = (await response.json()) as { success: boolean; error: { code: string } };

    expect(response.status).toBe(502);
    expect(body.error.code).toBe('UPSTREAM_ERROR');
  });
});
