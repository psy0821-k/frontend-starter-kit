import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/shared/api/auth/get-current-user';
import { createSupabaseAdminClient } from '@/shared/api/supabase/admin';
import { toErrorResponse } from '@/shared/api/response';
import { ApiError } from '@/shared/api/error';

/**
 * 회원 탈퇴. 삭제 대상 user id는 요청 body가 아니라 세션(getCurrentUser)에서
 * 서버가 직접 추출한다 — 클라이언트가 다른 사용자의 id를 보낼 수 없게 한다.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Next.js Route Handler 시그니처상 Request 인자가 필요하지만, user id는 세션에서만 추출하므로 body는 사용하지 않는다.
export async function DELETE(_request: Request): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();
    if (user === null) {
      throw new ApiError(401, 'AUTH_REQUIRED', '로그인이 필요합니다');
    }

    let admin;
    try {
      admin = createSupabaseAdminClient();
    } catch {
      throw new ApiError(500, 'INTERNAL_ERROR', '회원 탈퇴 기능을 사용할 수 없습니다');
    }

    const { error } = await admin.auth.admin.deleteUser(user.id);

    if (error) {
      throw new ApiError(502, 'UPSTREAM_ERROR', '회원 탈퇴에 실패했습니다');
    }

    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    return toErrorResponse(error);
  }
}
