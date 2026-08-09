import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/shared/api/supabase/server';

/**
 * 로그아웃 처리.
 * Supabase 세션을 종료하고 httpOnly 쿠키를 제거한다.
 */
export async function POST() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  return NextResponse.json({ success: true, data: null });
}
