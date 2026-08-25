import { afterEach, describe, expect, it, vi } from 'vitest';
import { getCurrentUser } from './get-current-user';

const getUser = vi.fn();
const maybeSingle = vi.fn();
const eq = vi.fn(() => ({ maybeSingle }));
const select = vi.fn(() => ({ eq }));
const from = vi.fn(() => ({ select }));

const isSupabaseConfigured = vi.fn(() => true);

vi.mock('@/shared/api/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    auth: { getUser: (...args: unknown[]) => getUser(...args) },
    from,
  })),
}));

vi.mock('@/shared/api/supabase/config', () => ({
  isSupabaseConfigured: () => isSupabaseConfigured(),
}));

afterEach(() => {
  vi.clearAllMocks();
  isSupabaseConfigured.mockReturnValue(true);
});

describe('getCurrentUser', () => {
  it('should return CurrentUser with profiles.nickname when session exists and profiles row exists', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'user-1', email: 'user@example.com' } } });
    maybeSingle.mockResolvedValue({ data: { nickname: 'profile-nick' }, error: null });

    const result = await getCurrentUser();

    expect(result).toEqual({ id: 'user-1', nickname: 'profile-nick' });
  });

  it('should fall back to user.email when profiles row has no nickname', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'user-1', email: 'user@example.com' } } });
    maybeSingle.mockResolvedValue({ data: null, error: null });

    const result = await getCurrentUser();

    expect(result).toEqual({ id: 'user-1', nickname: 'user@example.com' });
  });

  it('should return null when no session exists', async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    const result = await getCurrentUser();

    expect(result).toBeNull();
    expect(from).not.toHaveBeenCalled();
  });

  it('should return null when Supabase is not configured', async () => {
    isSupabaseConfigured.mockReturnValue(false);

    const result = await getCurrentUser();

    expect(result).toBeNull();
    expect(getUser).not.toHaveBeenCalled();
  });
});
