import { type EmailOtpType } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/shared/api/supabase/server';

/**
 * 이메일 인증 링크(회원가입 확인) 처리.
 * 이메일 템플릿의 {{ .ConfirmationURL }} 대신 이 경로를 쓰도록
 * Supabase 대시보드(Authentication > Emails > Confirm signup)에서
 * 링크를 `{{ .SiteURL }}/api/auth/confirm?token_hash={{ .TokenHash }}&type=email`로 바꿔야 한다.
 * OAuth 콜백(api/auth/callback)과 달리 code가 아닌 token_hash를 받는다.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;

  if (!tokenHash || !type) {
    return NextResponse.redirect(`${origin}/auth/login?error=invalid_confirmation_link`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

  if (error) {
    return NextResponse.redirect(`${origin}/auth/login?error=confirmation_failed`);
  }

  return NextResponse.redirect(origin);
}
