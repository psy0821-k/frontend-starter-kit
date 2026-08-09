const THUMBNAIL_BUCKET_SEGMENT = '/object/public/template-thumbnails/';

/**
 * 썸네일 공개 URL에서 Storage 버킷 내부 경로를 역산합니다.
 *
 * upload-thumbnail.ts가 getPublicUrl()로 발급한 URL은
 * '.../storage/v1/object/public/template-thumbnails/<path>' 형태를 따릅니다.
 * DB에는 이 URL 문자열만 저장되어 있어(별도 경로 컬럼 없음, PRD 결정 2 참조)
 * 삭제 시 이 함수로 경로를 되돌립니다.
 *
 * 예상 형식이 아니면(외부 URL을 썸네일로 쓴 과거 데이터 등) null을 반환합니다 —
 * 호출부는 이 경우 Storage 삭제를 건너뛰고 templates 행만 지웁니다.
 */
export function getThumbnailStoragePath(thumbnailUrl: string): string | null {
  const index = thumbnailUrl.indexOf(THUMBNAIL_BUCKET_SEGMENT);
  if (index === -1) {
    return null;
  }

  const path = thumbnailUrl.slice(index + THUMBNAIL_BUCKET_SEGMENT.length);
  return path.length > 0 ? path : null;
}
