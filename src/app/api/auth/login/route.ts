import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/shared/api/supabase/server';
import { mapSupabaseAuthError } from '@/shared/api/supabase/map-error';
import { ApiError } from '@/shared/api/error';
import { loginSchema } from '@/features/auth/model/schema';

/**
 * 이메일 로그인 처리.
 * Supabase가 반환하는 원본 에러는 mapSupabaseAuthError로 ApiErrorCode에 매핑해 흡수한다.
 * 이메일 미가입/비밀번호 오류는 Supabase가 이미 invalid_credentials 단일 코드로
 * 뭉뚱그려 반환하므로, 여기서 별도로 구분하는 로직을 추가하지 않는다.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as unknown;
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    const apiError = new ApiError(400, 'VALIDATION_ERROR', '입력값을 다시 확인해주세요');
    return NextResponse.json(
      { success: false, error: { code: apiError.code, message: apiError.message } },
      { status: apiError.status }
    );
  }

  const { email, password } = parsed.data;
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const apiError = mapSupabaseAuthError(error);
    return NextResponse.json(
      { success: false, error: { code: apiError.code, message: apiError.message } },
      { status: apiError.status }
    );
  }

  return NextResponse.json({ success: true, data: null });
}
