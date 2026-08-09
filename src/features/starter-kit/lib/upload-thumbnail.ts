import { createSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { ApiError } from '@/shared/api/error';

const THUMBNAIL_BUCKET = 'template-thumbnails';
const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024; // 5MB. Storage 버킷 설정과 동일한 값.
const ALLOWED_THUMBNAIL_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

/**
 * 썸네일 이미지를 Supabase Storage(public 버킷)에 업로드하고 공개 URL을 반환합니다.
 *
 * BFF를 거치지 않고 브라우저에서 Storage에 직접 업로드합니다. apiClient가
 * JSON 전용이라 멀티파트를 보낼 수 없고(schema.ts 주석 참조), templates 테이블과
 * 동일하게 "anon key + Storage RLS가 최종 방어선"인 모델을 따릅니다
 * (RLS 정책: supabase/migrations/002_template_thumbnail_storage.sql).
 *
 * 클라이언트 검증은 사용자 경험을 위한 것이며, 실제 방어선은 버킷 설정의
 * file_size_limit/allowed_mime_types와 RLS 정책이다.
 */
export async function uploadTemplateThumbnail(file: File): Promise<string> {
  if (!ALLOWED_THUMBNAIL_TYPES.includes(file.type)) {
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      'PNG, JPEG, WebP 형식의 이미지만 업로드할 수 있습니다'
    );
  }

  if (file.size > MAX_THUMBNAIL_SIZE) {
    throw new ApiError(400, 'VALIDATION_ERROR', '이미지 크기는 5MB 이하여야 합니다');
  }

  const supabase = createSupabaseBrowserClient();
  const extension = file.name.split('.').pop() ?? 'png';
  // 파일 경로 자체를 무작위로 만들어 다른 관리자가 올린 파일과 충돌하지 않게 한다.
  const path = `${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(THUMBNAIL_BUCKET).upload(path, file, {
    contentType: file.type,
  });

  if (error) {
    throw new ApiError(502, 'UPSTREAM_ERROR', '썸네일 업로드에 실패했습니다');
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(THUMBNAIL_BUCKET).getPublicUrl(path);

  return publicUrl;
}
