import { createClient } from '@supabase/supabase-js';
import { getSupabaseCredentials } from './config';

/**
 * 쿠키를 읽지 않는 공개(anon) Supabase 클라이언트.
 *
 * unstable_cache/use cache 스코프 안에서는 cookies()·headers() 같은 런타임 API를
 * 호출할 수 없다(Next.js가 명시적으로 금지). createSupabaseServerClient()는 내부에서
 * cookies()를 쓰므로 캐시 스코프 안에서 호출하면 즉시 에러가 난다.
 *
 * 인증이 필요 없는 공개 데이터(예: getFeatures)를 캐시된 함수 안에서 조회할 때만
 * 이 클라이언트를 쓴다. 사용자별 데이터(RLS가 auth.uid()를 참조하는 조회)에는
 * 쓰지 않는다 — 세션이 없어 RLS가 항상 익명 권한으로만 평가된다.
 */
export function createSupabasePublicClient() {
  const { url, anonKey } = getSupabaseCredentials();
  return createClient(url, anonKey);
}
