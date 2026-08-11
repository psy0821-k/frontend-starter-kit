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
] as const;

export type FeatureCategory = (typeof FEATURE_CATEGORIES)[number];
