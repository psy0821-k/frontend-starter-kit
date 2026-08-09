import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getSupabaseCredentials } from './config';

/**
 * Route Handler 전용 Supabase 서버 클라이언트.
 * Anon Key + 사용자 세션(쿠키) 기반으로만 동작하며 Service Role Key는 사용하지 않는다.
 */
export async function createSupabaseServerClient() {
  const { url, anonKey } = getSupabaseCredentials();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Component에서 호출된 경우 무시한다 — 세션 쓰기는
          // Route Handler(/api/auth/*)가 담당하므로 여기서는 갱신 실패해도 무해하다.
        }
      },
    },
  });
}
