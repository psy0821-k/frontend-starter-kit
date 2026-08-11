import { afterEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.resetModules();
  vi.restoreAllMocks();
});

describe('env', () => {
  it('NEXT_PUBLIC_SUPABASE_URL이 URL 형식이 아니면 부팅 시점에 실패한다', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'not-a-url';
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(import('./env')).rejects.toThrow();
  });

  it('Supabase 환경변수가 미설정(optional)이어도 정상 로드된다', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const { env } = await import('./env');

    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBeUndefined();
    expect(env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeUndefined();
  });

  it('유효한 Supabase 환경변수가 설정되면 정상 로드되고 값을 그대로 노출한다', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

    const { env } = await import('./env');

    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe('https://example.supabase.co');
    expect(env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe('anon-key');
  });
});
