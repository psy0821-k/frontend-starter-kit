import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/shared/api/supabase/server';

/**
 * Supabase OAuth 콜백 처리.
 * signInWithOAuth가 redirectTo로 지정하는 엔드포인트이며,
 * code를 세션으로 교환해 httpOnly 쿠키에 저장한다.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=oauth_failed`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/auth/login?error=oauth_failed`);
  }

  return NextResponse.redirect(origin);
}
