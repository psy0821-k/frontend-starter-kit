import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/shared/api/supabase/server';
import { getCurrentUser } from '@/shared/api/auth/get-current-user';
import { toErrorResponse } from '@/shared/api/response';
import { ApiError } from '@/shared/api/error';
import { nicknameSchema } from '@/features/mypage/model/schema';

/**
 * 닉네임 변경. 단일 필드 전체 교체라 PATCH가 아니라 PUT을 쓴다
 * (apiClient에 patch 메서드가 없다는 점과도 일치 — templates/[id]/route.ts 참조).
 */
export async function PUT(request: Request): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();
    if (user === null) {
      throw new ApiError(401, 'AUTH_REQUIRED', '로그인이 필요합니다');
    }

    const body = (await request.json()) as { nickname?: string };
    const parsed = nicknameSchema.safeParse(body.nickname);

    if (!parsed.success) {
      throw new ApiError(400, 'VALIDATION_ERROR', '올바르지 않은 닉네임 형식입니다');
    }

    const nickname = parsed.data;

    const supabase = await createSupabaseServerClient();
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('nickname', nickname)
      .maybeSingle<{ id: string }>();

    if (existing !== null && existing.id !== user.id) {
      throw new ApiError(409, 'CONFLICT', '이미 사용 중인 닉네임입니다');
    }

    const { error } = await supabase.from('profiles').update({ nickname }).eq('id', user.id);

    if (error) {
      throw new ApiError(502, 'UPSTREAM_ERROR', '닉네임 변경에 실패했습니다');
    }

    return NextResponse.json({ success: true, data: { nickname } });
  } catch (error) {
    return toErrorResponse(error);
  }
}
