import type { CreateTemplateInput, TemplateFormValues } from '../model/schema';
import { getLanguageFromPath } from './get-language-from-path';
import { splitCommaList } from './split-comma-list';

/**
 * 폼 값을 BFF 전송 형태로 변환합니다.
 *
 * 폼은 배열 필드를 콤마 구분 문자열로 다루므로(useAppForm의 `ZodType<T, T>`
 * 제약 때문에 스키마에서 transform 불가) 여기서 배열로 펼칩니다.
 * language와 sort_order는 사용자가 입력하지 않고 이 시점에 파생합니다.
 */
export function toCreateTemplateInput(values: TemplateFormValues): CreateTemplateInput {
  return {
    title: values.title.trim(),
    summary: values.summary.trim(),
    category: values.category,
    description: values.description.trim(),
    thumbnail_url: values.thumbnail_url.trim(),
    tags: splitCommaList(values.tags),
    features: splitCommaList(values.features),
    tech_stack: splitCommaList(values.tech_stack),
    preview_images: splitCommaList(values.preview_images),
    files: values.files.map((file, index) => {
      const filePath = file.file_path.trim();

      return {
        file_path: filePath,
        code: file.code,
        language: getLanguageFromPath(filePath),
        // 입력한 순서를 그대로 표시 순서로 쓴다. 파일 경로 알파벳순은
        // "보여주고 싶은 순서"(진입점 먼저)와 다르기 때문이다.
        sort_order: index,
      };
    }),
  };
}
