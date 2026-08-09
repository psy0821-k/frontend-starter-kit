import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/shared/api/supabase/server';
import { requireAdmin } from '@/shared/api/auth/require-admin';
import { toErrorResponse } from '@/shared/api/response';
import { ApiError } from '@/shared/api/error';
import { createTemplateSchema } from '@/features/starter-kit/model/schema';

/** Postgres unique_violation. 같은 템플릿에 동일 file_path가 두 번 들어온 경우. */
const UNIQUE_VIOLATION_CODE = '23505';

/**
 * 템플릿 등록.
 *
 * 템플릿과 파일 목록을 create_template RPC로 한 번에 저장합니다.
 * supabase-js는 다중 테이블 트랜잭션을 지원하지 않아 templates INSERT 후
 * template_files INSERT가 실패하면 고아 레코드가 남기 때문입니다.
 */
export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = (await request.json()) as unknown;
    const parsed = createTemplateSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError(400, 'VALIDATION_ERROR', '입력값을 다시 확인해주세요');
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc('create_template', { payload: parsed.data });

    if (error) {
      if (error.code === UNIQUE_VIOLATION_CODE) {
        throw new ApiError(409, 'CONFLICT', '이미 등록된 파일 경로가 있습니다');
      }
      throw new ApiError(502, 'UPSTREAM_ERROR', '템플릿 등록에 실패했습니다');
    }

    return NextResponse.json({ success: true, data: { id: data as string } }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
