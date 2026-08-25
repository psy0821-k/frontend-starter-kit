import { createSupabaseServerClient } from '@/shared/api/supabase/server';
import { isSupabaseConfigured } from '@/shared/api/supabase/config';
import type { BookmarkTargetType } from '../model/types';

/**
 * 특정 target_type에 대해 로그인 사용자가 북마크한 target_id 목록을 조회한다.
 *
 * 목록 카드의 초기 북마크 상태 하이드레이션에 사용한다(get-bookmark-state-for-server.ts와
 * 동일한 Supabase 미설정/비로그인 폴백 패턴).
 */
export async function getBookmarkedIds(
  targetType: BookmarkTargetType,
  userId: string | null
): Promise<Set<string>> {
  if (userId === null || !isSupabaseConfigured()) {
    return new Set();
  }

  const supabase = await createSupabaseServerClient();

  const { data } = (await supabase
    .from('bookmarks')
    .select('target_id')
    .eq('user_id', userId)
    .eq('target_type', targetType)) as { data: { target_id: string }[] | null };

  return new Set((data ?? []).map((row) => row.target_id));
}
