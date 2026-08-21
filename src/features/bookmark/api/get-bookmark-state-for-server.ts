import { createSupabaseServerClient } from '@/shared/api/supabase/server';
import { isSupabaseConfigured } from '@/shared/api/supabase/config';
import type { BookmarkState, BookmarkTarget } from '../model/types';

/**
 * 서버 컴포넌트 전용 북마크 상태 조회.
 *
 * 클라이언트용 getBookmarkState(bookmark-client.ts)는 fetch로 자기 자신의 Route Handler를
 * 호출하는 방식이라 서버 컴포넌트 렌더 중에는 상대 경로 fetch가 성립하지 않는다. 서버
 * 컴포넌트는 대신 Supabase를 직접 조회한다(get-starter-kit-by-id.ts와 동일한 패턴).
 *
 * Supabase가 설정되지 않은 개발 초기에는 항상 미북마크 상태로 폴백한다.
 */
export async function getBookmarkStateForServer(
  target: BookmarkTarget,
  userId: string | null
): Promise<BookmarkState> {
  if (!isSupabaseConfigured()) {
    return { isBookmarked: false, count: 0 };
  }

  const supabase = await createSupabaseServerClient();

  const { count } = (await supabase
    .from('bookmarks')
    .select('count', { count: 'exact', head: true })
    .eq('target_type', target.targetType)
    .eq('target_id', target.targetId)) as { count: number | null };

  if (userId === null) {
    return { isBookmarked: false, count: count ?? 0 };
  }

  const { data } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', userId)
    .eq('target_type', target.targetType)
    .eq('target_id', target.targetId)
    .maybeSingle<{ id: string }>();

  return { isBookmarked: data !== null, count: count ?? 0 };
}
