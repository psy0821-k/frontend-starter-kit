import { z } from 'zod';
import { STARTER_KIT_CATEGORIES } from './types';

const TITLE_MAX_LENGTH = 100;
const SUMMARY_MAX_LENGTH = 200;
const FILE_PATH_MAX_LENGTH = 255;
const CODE_MAX_LENGTH = 100_000;
const MAX_FILES = 50;

/**
 * 이미지 경로: 외부 URL 또는 public/ 기준 절대 경로를 허용한다.
 * 기존 mock이 '/mock/starter-kits/*.png' 형태를 쓰고 있어 후자가 필요하다.
 * apiClient가 multipart를 보내지 못하므로(Content-Type이 json으로 고정)
 * 이번 범위에서 파일 업로드는 지원하지 않고 경로 입력만 받는다.
 */
const imagePathSchema = z
  .string()
  .trim()
  .min(1, '이미지 경로를 입력해주세요')
  .refine(
    (value) => value.startsWith('/') || /^https?:\/\//.test(value),
    '/로 시작하는 경로이거나 http(s):// URL이어야 합니다'
  );

export const filePathSchema = z
  .string()
  .trim()
  .min(1, '파일 경로를 입력해주세요')
  .max(FILE_PATH_MAX_LENGTH, `파일 경로는 ${FILE_PATH_MAX_LENGTH}자 이하여야 합니다`)
  .refine((value) => !value.startsWith('/'), '/로 시작하지 않는 상대 경로를 입력해주세요')
  .refine((value) => !value.includes('\\'), '경로 구분자는 /를 사용해주세요');

export const templateFileSchema = z.object({
  file_path: filePathSchema,
  code: z
    .string()
    .min(1, '코드를 입력해주세요')
    .max(CODE_MAX_LENGTH, `코드는 ${CODE_MAX_LENGTH.toLocaleString()}자 이하여야 합니다`),
});

/**
 * 등록 폼 스키마.
 *
 * useAppForm이 `ZodType<T, T>`(입력 타입 = 출력 타입)를 요구하므로
 * `.transform()` / `.default()` / `z.coerce`를 쓸 수 없다. 따라서
 * tags·features·tech_stack·preview_images는 폼에서 **콤마 구분 문자열**로 받고,
 * `string[]` 변환은 제출 직전 lib/to-create-input.ts에서 수행한다.
 *
 * 반면 files는 `z.array(z.object(...))`라 입력/출력 타입이 같아 제약에 걸리지
 * 않으므로 배열 그대로 정의한다.
 */
export const templateFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, '제목을 입력해주세요')
    .max(TITLE_MAX_LENGTH, `제목은 ${TITLE_MAX_LENGTH}자 이하여야 합니다`),
  summary: z
    .string()
    .trim()
    .min(1, '한 줄 요약을 입력해주세요')
    .max(SUMMARY_MAX_LENGTH, `요약은 ${SUMMARY_MAX_LENGTH}자 이하여야 합니다`),
  category: z.enum(STARTER_KIT_CATEGORIES, { message: '카테고리를 선택해주세요' }),
  description: z.string().trim().min(1, '설명을 입력해주세요'),
  thumbnail_url: imagePathSchema,
  // 콤마 구분 문자열. 빈 값 허용 여부는 필드별로 다르다.
  tags: z.string().trim().min(1, '태그를 1개 이상 입력해주세요'),
  features: z.string().trim().min(1, '주요 기능을 1개 이상 입력해주세요'),
  tech_stack: z.string().trim().min(1, '사용 기술을 1개 이상 입력해주세요'),
  // 프리뷰 이미지는 없을 수 있다(코드만 제공하는 템플릿).
  preview_images: z.string().trim(),
  files: z
    .array(templateFileSchema)
    .min(1, '파일을 1개 이상 등록해주세요')
    .max(MAX_FILES, `파일은 ${MAX_FILES}개까지 등록할 수 있습니다`)
    .superRefine((files, ctx) => {
      // DB의 unique(template_id, file_path)에 걸리기 전에 폼에서 먼저 잡는다.
      // 서버 응답을 기다리지 않고 어느 행이 중복인지 정확히 짚어주기 위함이다.
      const seen = new Map<string, number>();

      files.forEach((file, index) => {
        const path = file.file_path.trim();
        if (!path) return;

        const firstIndex = seen.get(path);
        if (firstIndex === undefined) {
          seen.set(path, index);
          return;
        }

        ctx.addIssue({
          code: 'custom',
          message: '이미 등록한 파일 경로입니다',
          path: [index, 'file_path'],
        });
      });
    }),
});

export type TemplateFormValues = z.infer<typeof templateFormSchema>;

/**
 * BFF(Route Handler)로 전송하는 형태.
 * 폼 타입과 달리 배열 필드가 이미 string[]로 변환되어 있다.
 */
export const createTemplateSchema = z.object({
  title: z.string().trim().min(1).max(TITLE_MAX_LENGTH),
  summary: z.string().trim().min(1).max(SUMMARY_MAX_LENGTH),
  category: z.enum(STARTER_KIT_CATEGORIES),
  description: z.string().trim().min(1),
  thumbnail_url: imagePathSchema,
  tags: z.array(z.string().trim().min(1)).min(1),
  features: z.array(z.string().trim().min(1)).min(1),
  tech_stack: z.array(z.string().trim().min(1)).min(1),
  preview_images: z.array(imagePathSchema),
  files: z
    .array(
      templateFileSchema.extend({
        language: z.string().min(1),
        sort_order: z.number().int().min(0),
      })
    )
    .min(1)
    .max(MAX_FILES)
    .refine(
      (files) => new Set(files.map((file) => file.file_path)).size === files.length,
      '파일 경로가 중복되었습니다'
    ),
});

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
