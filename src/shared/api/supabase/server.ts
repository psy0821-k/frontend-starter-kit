import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { env } from '@/shared/config/env';

/**
 * Route Handler 전용 Supabase 서버 클라이언트.
 * Anon Key + 사용자 세션(쿠키) 기반으로만 동작하며 Service Role Key는 사용하지 않는다.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}
