import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/shared/api/supabase/server';
import { requireAdmin } from '@/shared/api/auth/require-admin';
import { toErrorResponse } from '@/shared/api/response';
import { ApiError } from '@/shared/api/error';
import { createTemplateSchema } from '@/features/starter-kit/model/schema';

const UNIQUE_VIOLATION_CODE = '23505';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * 템플릿 전체 교체.
 *
 * PATCH가 아니라 PUT인 이유는 파일 배열의 부분 수정 의미론이 모호하기
 * 때문입니다 — "files에 1개만 보내면 나머지는 유지인가 삭제인가"에 답이 없습니다.
 * update_template RPC가 기존 파일을 전량 삭제 후 재삽입하며, 이 역시 한
 * 트랜잭션 안에서 일어납니다. (apiClient에 patch 메서드가 없다는 점과도 맞습니다.)
 */
export async function PUT(request: Request, context: RouteContext) {
  try {
    await requireAdmin();

    const { id } = await context.params;
    const body = (await request.json()) as unknown;
    const parsed = createTemplateSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError(400, 'VALIDATION_ERROR', '입력값을 다시 확인해주세요');
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc('update_template', {
      target_id: id,
      payload: parsed.data,
    });

    if (error) {
      if (error.code === UNIQUE_VIOLATION_CODE) {
        throw new ApiError(409, 'CONFLICT', '이미 등록된 파일 경로가 있습니다');
      }
      throw new ApiError(502, 'UPSTREAM_ERROR', '템플릿 수정에 실패했습니다');
    }

    // RLS가 행을 숨기면 RPC가 null을 반환한다. 권한 없음과 존재하지 않음을
    // 모두 404로 처리해 리소스 존재 여부를 누설하지 않는다.
    if (data === null) {
      throw new ApiError(404, 'NOT_FOUND', '템플릿을 찾을 수 없습니다');
    }

    return NextResponse.json({ success: true, data: { id: data as string } });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/**
 * 템플릿 삭제.
 * template_files는 on delete cascade로 함께 삭제되므로 RPC가 필요 없습니다.
 */
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();

    const { id } = await context.params;
    const supabase = await createSupabaseServerClient();

    // select()를 붙여야 삭제된 행이 반환되어 대상 존재 여부를 판별할 수 있다.
    const { data, error } = await supabase.from('templates').delete().eq('id', id).select('id');

    if (error) {
      throw new ApiError(502, 'UPSTREAM_ERROR', '템플릿 삭제에 실패했습니다');
    }

    if (data === null || data.length === 0) {
      throw new ApiError(404, 'NOT_FOUND', '템플릿을 찾을 수 없습니다');
    }

    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    return toErrorResponse(error);
  }
}
