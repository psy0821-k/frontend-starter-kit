import { createSupabaseServerClient } from '@/shared/api/supabase/server';
import { isSupabaseConfigured } from '@/shared/api/supabase/config';

interface CurrentUser {
  id: string;
  nickname: string;
}

/**
 * 현재 세션의 사용자 정보를 조회한다.
 * 로그인 상태가 아니면 null을 반환한다 (requireAdmin과 달리 에러를 던지지 않음 —
 * Header·로그인 페이지 가드처럼 "로그인 안 함"이 정상 흐름인 곳에서 사용).
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const nickname = user.user_metadata?.nickname;

  return {
    id: user.id,
    nickname: typeof nickname === 'string' ? nickname : (user.email ?? ''),
  };
}
