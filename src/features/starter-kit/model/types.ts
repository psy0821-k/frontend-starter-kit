/**
 * 스타터 킷 도메인 타입
 * 필드명은 Supabase 테이블 컬럼(snake_case)과 1:1로 매핑되도록 정의합니다.
 * 추후 Supabase 연동 시 이 타입을 그대로 재사용할 수 있습니다.
 */
export interface StarterKit {
  id: string;
  title: string;
  summary: string;
  category: StarterKitCategory;
  tags: string[];
  thumbnail_url: string;
  description: string;
  features: string[];
  tech_stack: string[];
  preview_images: string[];
  updated_at: string;
}

/**
 * 카테고리 목록(순서 = 랜딩페이지 섹션 노출 순서).
 * Supabase 카테고리 테이블 연동 전까지는 코드 상수로 고정 관리합니다.
 */
export const STARTER_KIT_CATEGORIES = ['Frontend', 'Backend', 'Fullstack', 'Mobile'] as const;

export type StarterKitCategory = (typeof STARTER_KIT_CATEGORIES)[number];
