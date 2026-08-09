import { createSupabaseServerClient } from '@/shared/api/supabase/server';
import { isSupabaseConfigured } from '@/shared/api/supabase/config';
import { ApiError } from '@/shared/api/error';

interface AdminUser {
  id: string;
}

/**
 * 현재 세션이 관리자인지 확인하고 사용자 정보를 반환합니다.
 *
 * 관리자가 아니면 ApiError를 던집니다. 호출부(Route Handler)는 이를 잡아
 * 표준 에러 envelope로 변환하고, 서버 컴포넌트는 리다이렉트에 사용합니다.
 *
 * 권한이 없을 때 403이 아니라 404를 쓰는 이유는 403이 "그 리소스는 존재하지만
 * 당신 것이 아니다"라는 사실을 누설하기 때문입니다. 이는 RLS가 행을 숨겨
 * "0 rows"가 되는 실제 동작과도 일치합니다.
 *
 * 이 검사는 편의를 위한 것이며 최종 방어선이 아닙니다 — anon key는 브라우저에
 * 노출되므로 진짜 권한 통제는 DB의 RLS 정책이 담당합니다.
 */
export async function requireAdmin(): Promise<AdminUser> {
  if (!isSupabaseConfigured()) {
    throw new ApiError(503, 'INTERNAL_ERROR', 'Supabase가 설정되지 않았습니다');
  }

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user === null) {
    throw new ApiError(401, 'AUTH_REQUIRED', '로그인이 필요합니다');
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle<{ role: string }>();

  if (error) {
    throw new ApiError(502, 'UPSTREAM_ERROR', '권한 확인에 실패했습니다');
  }

  if (profile?.role !== 'admin') {
    throw new ApiError(404, 'NOT_FOUND', '페이지를 찾을 수 없습니다');
  }

  return { id: user.id };
}
