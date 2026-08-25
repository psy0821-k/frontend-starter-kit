import { createClient } from '@supabase/supabase-js';
import { env } from '@/shared/config/env';
import { getSupabaseCredentials } from './config';

/**
 * SUPABASE_SERVICE_ROLE_KEY로 생성하는 관리자 권한 Supabase 클라이언트.
 * 이 모듈은 /api/mypage/withdraw/route.ts에서만 import한다 — 다른 곳에서 사용 금지.
 * createSupabaseServerClient()(anon key 전용)와 별도로 존재한다.
 *
 * service_role key 미설정을 조용히 넘기지 않는다 — getSupabaseCredentials()가
 * anon key 미설정 시 에러를 던지는 기존 패턴과 동일하게 명시적으로 실패한다.
 */
export function createSupabaseAdminClient() {
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다. .env.local에 SUPABASE_SERVICE_ROLE_KEY를 추가해주세요.'
    );
  }

  const { url } = getSupabaseCredentials();

  return createClient(url, serviceRoleKey);
}
