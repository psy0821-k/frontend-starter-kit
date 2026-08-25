import { afterEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.resetModules();
});

describe('createSupabaseAdminClient', () => {
  it('SUPABASE_SERVICE_ROLE_KEY가 없을 때 호출하면 명시적 에러를 던져야 한다', async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;

    const { createSupabaseAdminClient } = await import('./admin');

    expect(() => createSupabaseAdminClient()).toThrow(/SUPABASE_SERVICE_ROLE_KEY/);
  });
});
