import { env } from '@/shared/config/env';

interface SupabaseCredentials {
  url: string;
  anonKey: string;
}

/**
 * Supabase 연결 정보가 설정되어 있는지 확인합니다.
 *
 * 환경변수를 optional로 둔 이유는 프로젝트 연결 전에도 앱이 뜨고 mock 데이터로
 * 화면을 확인할 수 있어야 하기 때문입니다. 데이터 조회 계층은 이 함수로 미설정을
 * 감지해 mock으로 폴백하고, 쓰기 경로는 getSupabaseCredentials로 명확히 실패합니다.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * Supabase 연결 정보를 반환합니다. 미설정이면 에러를 던집니다 —
 * 설정 누락을 조용히 넘기면 인증·쓰기가 말없이 실패하기 때문입니다.
 */
export function getSupabaseCredentials(): SupabaseCredentials {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Supabase 환경변수가 설정되지 않았습니다. .env.local에 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 추가해주세요.'
    );
  }

  return { url, anonKey };
}
