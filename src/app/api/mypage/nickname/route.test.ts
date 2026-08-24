import { afterEach, describe, expect, it, vi } from 'vitest';
import { PUT } from './route';

const getCurrentUser = vi.fn();
const maybeSingle = vi.fn();
const eq = vi.fn(() => ({ maybeSingle }));
const select = vi.fn(() => ({ eq }));
const updateEq = vi.fn();
const update = vi.fn(() => ({ eq: updateEq }));
const from = vi.fn(() => ({ select, update }));

vi.mock('@/shared/api/auth/get-current-user', () => ({
  getCurrentUser: (...args: unknown[]) => getCurrentUser(...args),
}));

vi.mock('@/shared/api/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(async () => ({ from })),
}));

function createRequest(body: unknown): Request {
  return new Request('http://localhost/api/mypage/nickname', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('PUT /api/mypage/nickname', () => {
  it('should update profiles.nickname and return the new nickname when the new nickname is available', async () => {
    getCurrentUser.mockResolvedValue({ id: 'user-1', nickname: 'old-nick' });
    maybeSingle.mockResolvedValue({ data: null, error: null });
    updateEq.mockResolvedValue({ error: null });

    const response = await PUT(createRequest({ nickname: 'new-nick' }));
    const body = (await response.json()) as { success: boolean; data: { nickname: string } };

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.nickname).toBe('new-nick');
  });

  it("should update successfully (no-op semantics) when the submitted nickname equals the caller's own current nickname", async () => {
    getCurrentUser.mockResolvedValue({ id: 'user-1', nickname: 'same-nick' });
    maybeSingle.mockResolvedValue({ data: { id: 'user-1', nickname: 'same-nick' }, error: null });
    updateEq.mockResolvedValue({ error: null });

    const response = await PUT(createRequest({ nickname: 'same-nick' }));
    const body = (await response.json()) as { success: boolean; data: { nickname: string } };

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.nickname).toBe('same-nick');
  });

  it('should return 401 AUTH_REQUIRED when the caller is not logged in', async () => {
    getCurrentUser.mockResolvedValue(null);

    const response = await PUT(createRequest({ nickname: 'new-nick' }));
    const body = (await response.json()) as { success: boolean; error: { code: string } };

    expect(response.status).toBe(401);
    expect(body.error.code).toBe('AUTH_REQUIRED');
  });

  it('should return 400 VALIDATION_ERROR when nickname is shorter than 2 characters', async () => {
    getCurrentUser.mockResolvedValue({ id: 'user-1', nickname: 'old-nick' });

    const response = await PUT(createRequest({ nickname: 'a' }));
    const body = (await response.json()) as { success: boolean; error: { code: string } };

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 VALIDATION_ERROR when nickname is longer than 20 characters', async () => {
    getCurrentUser.mockResolvedValue({ id: 'user-1', nickname: 'old-nick' });

    const response = await PUT(createRequest({ nickname: 'a'.repeat(21) }));
    const body = (await response.json()) as { success: boolean; error: { code: string } };

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 409 CONFLICT when nickname is already used by another user', async () => {
    getCurrentUser.mockResolvedValue({ id: 'user-1', nickname: 'old-nick' });
    maybeSingle.mockResolvedValue({ data: { id: 'other-user', nickname: 'taken' }, error: null });

    const response = await PUT(createRequest({ nickname: 'taken' }));
    const body = (await response.json()) as { success: boolean; error: { code: string } };

    expect(response.status).toBe(409);
    expect(body.error.code).toBe('CONFLICT');
  });

  it('should return 502 UPSTREAM_ERROR when the profiles UPDATE fails for a reason other than uniqueness', async () => {
    getCurrentUser.mockResolvedValue({ id: 'user-1', nickname: 'old-nick' });
    maybeSingle.mockResolvedValue({ data: null, error: null });
    updateEq.mockResolvedValue({ error: { code: '55000', message: 'db down' } });

    const response = await PUT(createRequest({ nickname: 'new-nick' }));
    const body = (await response.json()) as { success: boolean; error: { code: string } };

    expect(response.status).toBe(502);
    expect(body.error.code).toBe('UPSTREAM_ERROR');
  });
});
