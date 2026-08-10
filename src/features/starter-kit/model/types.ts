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
  author_id: string;
  created_at: string;
  updated_at: string;
  /**
   * 상세 조회에서만 채워집니다. 목록 조회는 카드 UI가 코드를 쓰지 않으므로
   * template_files를 조인하지 않습니다(불필요한 페이로드 방지).
   */
  files?: TemplateFile[];
}

/**
 * 템플릿을 구성하는 파일 하나.
 *
 * file_path는 'src/features/auth/ui/login-form.tsx'처럼 폴더 경로와 파일명을
 * 합친 전체 경로를 담습니다. 두 필드로 쪼개지 않는 이유는 항상 붙여 쓰고 따로
 * 조회할 일이 없어 조합·검증 코드만 늘어나기 때문입니다. 파일명이 필요하면
 * 마지막 세그먼트를 파생해 사용합니다.
 */
export interface TemplateFile {
  file_path: string;
  code: string;
  language: string;
  sort_order: number;
  /**
   * 라이브 미리보기(Sandpack)가 렌더링을 시작하는 엔트리 파일 여부.
   * 템플릿당 최대 1개만 true일 수 있습니다(DB 부분 유니크 인덱스로 강제).
   * 과거 데이터 호환을 위해 optional이며, 없으면 false로 취급합니다.
   */
  is_entry?: boolean;
}

/**
 * 카테고리 목록(순서 = 랜딩페이지 섹션 노출 순서).
 * Supabase 카테고리 테이블 연동 전까지는 코드 상수로 고정 관리합니다.
 */
export const STARTER_KIT_CATEGORIES = ['erp', '포트폴리오', '쇼핑몰'] as const;

export type StarterKitCategory = (typeof STARTER_KIT_CATEGORIES)[number];
