import type { TemplateFormValues } from '../model/schema';
import type { StarterKit } from '../model/types';

/**
 * 조회된 템플릿(StarterKit)을 등록/수정 폼의 초기값으로 변환합니다.
 *
 * toCreateTemplateInput(폼 → 배열)의 역방향입니다. 배열 필드를 콤마 구분
 * 문자열로 되돌리는 이유는 폼이 항상 문자열로 다루기 때문입니다
 * (useAppForm의 ZodType<T, T> 제약, model/schema.ts 참조).
 *
 * files는 상세 조회에서만 채워지므로(model/types.ts 참조) 없으면 빈 배열로
 * 둡니다 — 수정 화면은 항상 상세 조회 결과를 넘기므로 실제로는 발생하지 않습니다.
 */
export function toTemplateFormValues(starterKit: StarterKit): TemplateFormValues {
  return {
    title: starterKit.title,
    summary: starterKit.summary,
    category: starterKit.category,
    description: starterKit.description,
    thumbnail_url: starterKit.thumbnail_url,
    tags: starterKit.tags.join(', '),
    features: starterKit.features.join(', '),
    tech_stack: starterKit.tech_stack.join(', '),
    preview_images: starterKit.preview_images.join(', '),
    files: (starterKit.files ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((file) => ({ file_path: file.file_path, code: file.code })),
  };
}
