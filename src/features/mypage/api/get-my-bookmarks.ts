import { createSupabaseServerClient } from '@/shared/api/supabase/server';
import { isSupabaseConfigured } from '@/shared/api/supabase/config';

export type MyBookmarkTargetType = 'template' | 'feature';

export interface MyBookmarkItem {
  targetType: MyBookmarkTargetType;
  targetId: string;
  title: string;
  /** template만 존재. templates.thumbnail_url. feature는 이미지 컬럼이 없어 항상 undefined. */
  thumbnailUrl?: string;
  createdAt: string; // bookmarks.created_at, ISO 문자열
}

interface BookmarkRow {
  target_type: MyBookmarkTargetType;
  target_id: string;
  created_at: string;
}

interface TitleRow {
  id: string;
  title: string;
  thumbnail_url?: string;
}

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

interface TitleInfo {
  title: string;
  thumbnailUrl?: string;
}

/**
 * targetType별 테이블(templates/features)에서 제목·썸네일을 조회해 infoByTypeAndId에 채운다.
 * features 테이블은 thumbnail_url 컬럼이 없으므로 select 문자열을 테이블에 맞게 분기한다.
 * ids가 비어있으면 조회를 건너뛴다.
 */
async function fillTitles(
  supabase: SupabaseServerClient,
  table: 'templates' | 'features',
  targetType: MyBookmarkTargetType,
  ids: string[],
  infoByTypeAndId: Map<string, TitleInfo>
): Promise<void> {
  if (ids.length === 0) {
    return;
  }

  const columns = table === 'templates' ? 'id, title, thumbnail_url' : 'id, title';
  const { data: rows } = (await supabase.from(table).select(columns).in('id', ids)) as {
    data: TitleRow[] | null;
  };

  (rows ?? []).forEach((row) => {
    infoByTypeAndId.set(`${targetType}:${row.id}`, {
      title: row.title,
      thumbnailUrl: row.thumbnail_url,
    });
  });
}

/**
 * 로그인 사용자의 북마크를 target_type별로 templates/features와 join하여 조회한다.
 * 서버 컴포넌트(src/app/mypage/page.tsx) 전용 — get-bookmark-state-for-server.ts와 동일하게
 * Supabase를 직접 조회한다(클라이언트 fetch 방식이 아님).
 * - Supabase가 설정되지 않은 경우(isSupabaseConfigured() === false) 빈 배열을 반환한다.
 * - 원본(templates/features)이 삭제되어 join 결과가 없는 북마크는 배열에서 제외한다
 *   (조용히 필터링 — 에러를 던지지 않음).
 * - created_at 내림차순(최신 북마크 먼저)으로 정렬한다.
 */
export async function getMyBookmarks(userId: string): Promise<MyBookmarkItem[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createSupabaseServerClient();

  const { data: bookmarkRows } = (await supabase
    .from('bookmarks')
    .select('target_type, target_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })) as { data: BookmarkRow[] | null };

  const bookmarks = [...(bookmarkRows ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (bookmarks.length === 0) {
    return [];
  }

  const templateIds = bookmarks
    .filter((bookmark) => bookmark.target_type === 'template')
    .map((bookmark) => bookmark.target_id);
  const featureIds = bookmarks
    .filter((bookmark) => bookmark.target_type === 'feature')
    .map((bookmark) => bookmark.target_id);

  const infoByTypeAndId = new Map<string, TitleInfo>();

  await fillTitles(supabase, 'templates', 'template', templateIds, infoByTypeAndId);
  await fillTitles(supabase, 'features', 'feature', featureIds, infoByTypeAndId);

  return bookmarks.reduce<MyBookmarkItem[]>((items, bookmark) => {
    const info = infoByTypeAndId.get(`${bookmark.target_type}:${bookmark.target_id}`);
    if (info === undefined) {
      return items;
    }
    items.push({
      targetType: bookmark.target_type,
      targetId: bookmark.target_id,
      title: info.title,
      thumbnailUrl: info.thumbnailUrl,
      createdAt: bookmark.created_at,
    });
    return items;
  }, []);
}
