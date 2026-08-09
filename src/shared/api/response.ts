import { NextResponse } from 'next/server';
import { ApiError } from './error';
import type { ApiErrorCode } from '@/types/api';

/**
 * Route Handler 에러 응답을 표준 envelope로 변환합니다.
 *
 * 기존 핸들러(auth/*)는 envelope 리터럴을 손으로 작성하지만, 템플릿 API는
 * 검증·권한·업스트림 등 실패 분기가 많아 같은 리터럴이 반복됩니다.
 * ApiError를 그대로 넘길 수 있게 해 분기마다 status/code를 다시 적지 않습니다.
 *
 * 성공 응답은 분기가 없어 `NextResponse.json({ success: true, data })`를
 * 그대로 쓰는 편이 읽기 쉬우므로 헬퍼를 만들지 않습니다.
 */
export function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { success: false, error: { code: error.code, message: error.message } },
      { status: error.status }
    );
  }

  // 예상 밖의 에러는 원문을 노출하지 않는다 — 스택이나 DB 메시지가
  // 그대로 나가면 내부 구조를 누설한다.
  const code: ApiErrorCode = 'INTERNAL_ERROR';
  return NextResponse.json(
    { success: false, error: { code, message: '요청을 처리하지 못했습니다' } },
    { status: 500 }
  );
}
