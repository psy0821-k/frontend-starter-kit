import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/shared/api/supabase/server';
import { ApiError } from '@/shared/api/error';
import { nicknameSchema } from '@/features/auth/model/schema';

/**
 * 닉네임 중복 여부 조회.
 * profiles 테이블(nickname 컬럼)을 대상으로 하며, 실제 테이블/컬럼명은
 * Supabase 스키마 확정 시점(MCP 연결 이후)에 맞춰 조정한다.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as { nickname?: string };
  const parsed = nicknameSchema.safeParse(body.nickname);

  if (!parsed.success) {
    const apiError = new ApiError(400, 'VALIDATION_ERROR', '올바르지 않은 닉네임 형식입니다');
    return NextResponse.json(
      { success: false, error: { code: apiError.code, message: apiError.message } },
      { status: apiError.status }
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('nickname')
    .eq('nickname', parsed.data)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '닉네임 조회에 실패했습니다' } },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data: { available: data === null } });
}
