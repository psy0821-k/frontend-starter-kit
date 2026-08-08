import { createBrowserClient } from '@supabase/ssr';
import { env } from '@/shared/config/env';

/**
 * 브라우저용 Supabase 클라이언트.
 * OAuth 리다이렉트(signInWithOAuth)처럼 브라우저가 직접 트리거해야 하는
 * Supabase 표준 패턴에만 사용한다. 그 외 가입/조회 등은 BFF(Route Handler)를 거친다.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
