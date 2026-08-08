import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/shared/api/supabase/server';
import { mapSupabaseAuthError } from '@/shared/api/supabase/map-error';
import { ApiError } from '@/shared/api/error';
import { registerSchema } from '@/features/auth/model/schema';

/**
 * 이메일 회원가입 처리.
 * Supabase가 반환하는 원본 에러는 mapSupabaseAuthError로 ApiErrorCode에 매핑해 흡수한다.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as unknown;
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    const apiError = new ApiError(400, 'VALIDATION_ERROR', '입력값을 다시 확인해주세요');
    return NextResponse.json(
      { success: false, error: { code: apiError.code, message: apiError.message } },
      { status: apiError.status }
    );
  }

  const { email, password, nickname, name } = parsed.data;
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nickname, name },
    },
  });

  if (error) {
    const apiError = mapSupabaseAuthError(error);
    return NextResponse.json(
      { success: false, error: { code: apiError.code, message: apiError.message } },
      { status: apiError.status }
    );
  }

  return NextResponse.json({ success: true, data: null });
}
