import { afterEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.resetModules();
});

describe('isSupabaseConfigured', () => {
  it('should return false when both Supabase env vars are unset', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const { isSupabaseConfigured } = await import('./config');

    expect(isSupabaseConfigured()).toBe(false);
  });

  it('should return false when only one Supabase env var is set', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const { isSupabaseConfigured } = await import('./config');

    expect(isSupabaseConfigured()).toBe(false);
  });

  it('should return true when both Supabase env vars are set', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

    const { isSupabaseConfigured } = await import('./config');

    expect(isSupabaseConfigured()).toBe(true);
  });
});

describe('getSupabaseCredentials', () => {
  it('should throw a descriptive error when Supabase env vars are unset', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const { getSupabaseCredentials } = await import('./config');

    expect(() => getSupabaseCredentials()).toThrow(
      /NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_ANON_KEY|\.env\.local/
    );
  });

  it('should return the configured url and anonKey when both env vars are set', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

    const { getSupabaseCredentials } = await import('./config');

    expect(getSupabaseCredentials()).toEqual({
      url: 'https://example.supabase.co',
      anonKey: 'anon-key',
    });
  });
});
