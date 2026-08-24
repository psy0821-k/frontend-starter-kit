import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/shared/api/supabase/server';
import { getCurrentUser } from '@/shared/api/auth/get-current-user';
import { toErrorResponse } from '@/shared/api/response';
import { ApiError } from '@/shared/api/error';
import { BOOKMARK_TARGET_TYPES } from '@/features/bookmark/model/types';
import type {
  BookmarkState,
  BookmarkTarget,
  BookmarkTargetType,
} from '@/features/bookmark/model/types';

/** Postgres unique_violation. 이미 북마크된 target에 재요청한 경우. */
const UNIQUE_VIOLATION_CODE = '23505';

function parseTarget(searchParams: URLSearchParams): BookmarkTarget {
  const targetType = searchParams.get('targetType');
  const targetId = searchParams.get('targetId');

  if (
    targetType === null ||
    targetId === null ||
    !BOOKMARK_TARGET_TYPES.includes(targetType as BookmarkTargetType)
  ) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'targetType 또는 targetId가 올바르지 않습니다');
  }

  return { targetType: targetType as BookmarkTargetType, targetId };
}

function parseTargetFromBody(body: unknown): BookmarkTarget {
  if (
    typeof body !== 'object' ||
    body === null ||
    !('targetType' in body) ||
    !('targetId' in body)
  ) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'targetType 또는 targetId가 올바르지 않습니다');
  }

  const { targetType, targetId } = body as { targetType: unknown; targetId: unknown };

  if (
    typeof targetType !== 'string' ||
    typeof targetId !== 'string' ||
    !BOOKMARK_TARGET_TYPES.includes(targetType as BookmarkTargetType)
  ) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'targetType 또는 targetId가 올바르지 않습니다');
  }

  return { targetType: targetType as BookmarkTargetType, targetId };
}

/**
 * target이 실제로 존재하는지 검증한다.
 *
 * template은 DB(templates 테이블)에, feature는 DB(features 테이블)에 존재해야 한다.
 * bookmarks.target_id는 두 타입을 한 컬럼에 섞어야 해서 FK를 걸 수 없으므로
 * (polymorphic association), 애플리케이션 레벨에서 대신 검증한다.
 */
async function assertTargetExists(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  target: BookmarkTarget
): Promise<void> {
  if (target.targetType === 'feature') {
    const { data } = await supabase
      .from('features')
      .select('id')
      .eq('id', target.targetId)
      .maybeSingle<{ id: string }>();

    if (data === null) {
      throw new ApiError(400, 'VALIDATION_ERROR', '존재하지 않는 feature입니다');
    }
    return;
  }

  const { data } = await supabase
    .from('templates')
    .select('id')
    .eq('id', target.targetId)
    .maybeSingle<{ id: string }>();

  if (data === null) {
    throw new ApiError(404, 'NOT_FOUND', '템플릿을 찾을 수 없습니다');
  }
}

async function getBookmarkStateFor(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  target: BookmarkTarget,
  userId: string | null
): Promise<BookmarkState> {
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

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const target = parseTarget(url.searchParams);

    const supabase = await createSupabaseServerClient();
    await assertTargetExists(supabase, target);

    const user = await getCurrentUser();
    const state = await getBookmarkStateFor(supabase, target, user?.id ?? null);

    return NextResponse.json({ success: true, data: state });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();
    if (user === null) {
      throw new ApiError(401, 'AUTH_REQUIRED', '로그인이 필요합니다');
    }

    const body = (await request.json()) as unknown;
    const target = parseTargetFromBody(body);

    const supabase = await createSupabaseServerClient();
    await assertTargetExists(supabase, target);

    const { error } = await supabase.from('bookmarks').insert({
      user_id: user.id,
      target_type: target.targetType,
      target_id: target.targetId,
    });

    if (error && error.code !== UNIQUE_VIOLATION_CODE) {
      throw new ApiError(502, 'UPSTREAM_ERROR', '북마크 등록에 실패했습니다');
    }

    const state = await getBookmarkStateFor(supabase, target, user.id);
    return NextResponse.json({ success: true, data: state });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(request: Request): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();
    if (user === null) {
      throw new ApiError(401, 'AUTH_REQUIRED', '로그인이 필요합니다');
    }

    const url = new URL(request.url);
    const target = parseTarget(url.searchParams);

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', user.id)
      .eq('target_type', target.targetType)
      .eq('target_id', target.targetId);

    if (error) {
      throw new ApiError(502, 'UPSTREAM_ERROR', '북마크 해제에 실패했습니다');
    }

    const state = await getBookmarkStateFor(supabase, target, user.id);
    return NextResponse.json({ success: true, data: state });
  } catch (error) {
    return toErrorResponse(error);
  }
}
