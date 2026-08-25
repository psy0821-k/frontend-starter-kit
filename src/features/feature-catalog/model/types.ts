/**
 * Feature 도메인 타입.
 * 향후 Supabase `features` 테이블 연동 시 필드명을 그대로 재사용할 수 있도록
 * snake_case가 아닌 값(id/title/description/category)만 최소로 둡니다.
 */
export interface Feature {
  id: string;
  title: string;
  description: string;
  category: FeatureCategory;
}

/** 카테고리 목록 (routing.md의 Feature 예시 기반). */
export const FEATURE_CATEGORIES = [
  'search',
  'board',
  'comment',
  'payment',
  'notification',
  'form',
  'ui',
  'performance',
] as const;

export type FeatureCategory = (typeof FEATURE_CATEGORIES)[number];

/** Feature를 구성하는 파일 하나. TemplateFile과 대칭 구조입니다. */
export interface FeatureFile {
  file_path: string;
  code: string;
  language: string;
  sort_order: number;
}

/** Feature 상세 조회 전용 타입. 목록 조회(Feature)에 없는 필드를 추가로 포함합니다. */
export interface FeatureDetail extends Feature {
  summary: string;
  tags: string[];
  tech_stack: string[];
  usage: string;
  files: FeatureFile[];
}
