import type { StarterKit, TemplateFile } from '../model/types';

/**
 * mock 데이터의 소유자 자리표시자.
 * 실제 시딩(supabase/seed/001_seed_templates.sql)에서는 관리자 계정의
 * UUID로 치환되며, 이 값은 DB 연동 전 타입을 만족시키기 위한 것입니다.
 */
const MOCK_AUTHOR_ID = '00000000-0000-0000-0000-000000000000';

/**
 * 코드 뷰어 확인용 샘플 파일.
 * 폴더가 서로 다른 파일을 섞어 두어 경로 표시와 정렬을 함께 검증합니다.
 */
const MOCK_TEMPLATE_FILES: TemplateFile[] = [
  {
    file_path: 'src/features/auth/model/schema.ts',
    language: 'typescript',
    sort_order: 0,
    code: `import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, '이메일을 입력해주세요').email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
`,
  },
  {
    file_path: 'src/features/auth/ui/login-form.tsx',
    language: 'tsx',
    sort_order: 1,
    code: `'use client';

import { useAppForm } from '@/shared/lib/hooks/use-app-form';
import { loginSchema } from '../model/schema';

export function LoginForm() {
  const form = useAppForm(loginSchema, {
    defaultValues: { email: '', password: '' },
  });

  const { register, formState } = form;

  return (
    <form noValidate>
      <input {...register('email')} aria-invalid={!!formState.errors.email} />
      <input {...register('password')} type="password" />
    </form>
  );
}
`,
  },
  {
    file_path: 'src/app/api/auth/login/route.ts',
    language: 'typescript',
    sort_order: 2,
    code: `import { NextResponse } from 'next/server';
import { loginSchema } from '@/features/auth/model/schema';

export async function POST(request: Request) {
  const body = (await request.json()) as unknown;
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: '입력값을 다시 확인해주세요' } },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true, data: null });
}
`,
  },
];

/**
 * 정적 mock 데이터.
 * Supabase 연동 시 이 파일 대신 실제 쿼리 결과로 교체하고,
 * getStarterKits()의 내부 구현만 바꾸면 호출부는 변경할 필요가 없습니다.
 *
 * created_at은 실제 등록 시각이 존재하지 않으므로 updated_at과 동일하게 둡니다
 * (= 등록 후 수정된 적 없음). 상세 페이지는 두 날짜가 같으면 "등록"만 표시합니다.
 */
export const MOCK_STARTER_KITS: StarterKit[] = [
  {
    id: '3f9c1e6a-2b3a-4c1a-9c1a-000000000001',
    title: 'Next.js SaaS Starter',
    summary: '결제와 인증이 포함된 SaaS 랜딩 스타터',
    category: 'erp',
    tags: ['Next.js', 'Tailwind', 'Stripe'],
    thumbnail_url: '/mock/starter-kits/saas-starter.png',
    description: 'SaaS 제품 런칭에 필요한 랜딩페이지, 요금제, 인증 플로우를 갖춘 스타터입니다.',
    features: ['소셜 로그인', '구독 결제', '반응형 랜딩'],
    tech_stack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Stripe'],
    preview_images: [
      '/mock/starter-kits/saas-starter-1.png',
      '/mock/starter-kits/saas-starter-2.png',
    ],
    author_id: MOCK_AUTHOR_ID,
    created_at: '2026-07-18T09:00:00.000Z',
    updated_at: '2026-08-01T09:00:00.000Z',
    files: MOCK_TEMPLATE_FILES,
  },
  {
    id: '3f9c1e6a-2b3a-4c1a-9c1a-000000000002',
    title: 'Admin Dashboard Kit',
    summary: '차트와 테이블이 포함된 관리자 대시보드',
    category: 'erp',
    tags: ['Dashboard', 'Chart', 'Table'],
    thumbnail_url: '/mock/starter-kits/admin-dashboard.png',
    description: '데이터 시각화와 CRUD 테이블을 갖춘 관리자용 대시보드 스타터입니다.',
    features: ['차트 위젯', '데이터 테이블', '다크모드'],
    tech_stack: ['Next.js', 'TypeScript', 'Recharts'],
    preview_images: ['/mock/starter-kits/admin-dashboard-1.png'],
    author_id: MOCK_AUTHOR_ID,
    created_at: '2026-07-28T09:00:00.000Z',
    updated_at: '2026-07-28T09:00:00.000Z',
  },
  {
    id: '3f9c1e6a-2b3a-4c1a-9c1a-000000000003',
    title: 'Portfolio Starter',
    summary: '개인 포트폴리오를 위한 미니멀 스타터',
    category: '포트폴리오',
    tags: ['Portfolio', 'Minimal'],
    thumbnail_url: '/mock/starter-kits/portfolio.png',
    description: '프로젝트 목록과 자기소개를 담는 미니멀 포트폴리오 템플릿입니다.',
    features: ['프로젝트 갤러리', 'MDX 블로그', 'SEO 최적화'],
    tech_stack: ['Next.js', 'MDX', 'Tailwind CSS'],
    preview_images: ['/mock/starter-kits/portfolio-1.png'],
    author_id: MOCK_AUTHOR_ID,
    created_at: '2026-07-20T09:00:00.000Z',
    updated_at: '2026-07-20T09:00:00.000Z',
  },
  {
    id: '3f9c1e6a-2b3a-4c1a-9c1a-000000000004',
    title: 'Express REST API Starter',
    summary: '인증과 검증이 포함된 REST API 스타터',
    category: 'erp',
    tags: ['Express', 'REST', 'JWT'],
    thumbnail_url: '/mock/starter-kits/express-api.png',
    description: 'JWT 인증과 요청 검증 미들웨어를 갖춘 REST API 서버 스타터입니다.',
    features: ['JWT 인증', '요청 검증', '에러 핸들링'],
    tech_stack: ['Express', 'TypeScript', 'Zod'],
    preview_images: ['/mock/starter-kits/express-api-1.png'],
    author_id: MOCK_AUTHOR_ID,
    created_at: '2026-07-30T09:00:00.000Z',
    updated_at: '2026-07-30T09:00:00.000Z',
  },
  {
    id: '3f9c1e6a-2b3a-4c1a-9c1a-000000000005',
    title: 'NestJS Microservice Kit',
    summary: '마이크로서비스 구조의 NestJS 스타터',
    category: 'erp',
    tags: ['NestJS', 'Microservice'],
    thumbnail_url: '/mock/starter-kits/nestjs-kit.png',
    description: '모듈 단위로 분리된 마이크로서비스 아키텍처 스타터입니다.',
    features: ['모듈 분리', 'gRPC 통신', 'Docker 설정'],
    tech_stack: ['NestJS', 'TypeScript', 'Docker'],
    preview_images: ['/mock/starter-kits/nestjs-kit-1.png'],
    author_id: MOCK_AUTHOR_ID,
    created_at: '2026-07-15T09:00:00.000Z',
    updated_at: '2026-07-15T09:00:00.000Z',
  },
  {
    id: '3f9c1e6a-2b3a-4c1a-9c1a-000000000006',
    title: 'Full-stack E-commerce Kit',
    summary: '프론트와 백엔드가 통합된 쇼핑몰 스타터',
    category: '쇼핑몰',
    tags: ['E-commerce', 'Fullstack'],
    thumbnail_url: '/mock/starter-kits/ecommerce-kit.png',
    description: '상품 목록, 장바구니, 결제까지 포함된 풀스택 쇼핑몰 스타터입니다.',
    features: ['상품 관리', '장바구니', '결제 연동'],
    tech_stack: ['Next.js', 'Node.js', 'PostgreSQL'],
    preview_images: [
      '/mock/starter-kits/ecommerce-kit-1.png',
      '/mock/starter-kits/ecommerce-kit-2.png',
    ],
    author_id: MOCK_AUTHOR_ID,
    created_at: '2026-08-03T09:00:00.000Z',
    updated_at: '2026-08-03T09:00:00.000Z',
  },
  {
    id: '3f9c1e6a-2b3a-4c1a-9c1a-000000000007',
    title: 'React Native Starter',
    summary: '크로스플랫폼 모바일 앱 스타터',
    category: '포트폴리오',
    tags: ['React Native', 'Expo'],
    thumbnail_url: '/mock/starter-kits/react-native-starter.png',
    description: 'Expo 기반으로 iOS/Android를 동시에 지원하는 모바일 앱 스타터입니다.',
    features: ['네비게이션 설정', '푸시 알림', '다크모드'],
    tech_stack: ['React Native', 'Expo', 'TypeScript'],
    preview_images: ['/mock/starter-kits/react-native-starter-1.png'],
    author_id: MOCK_AUTHOR_ID,
    created_at: '2026-07-25T09:00:00.000Z',
    updated_at: '2026-07-25T09:00:00.000Z',
  },
  {
    id: '3f9c1e6a-2b3a-4c1a-9c1a-000000000008',
    title: 'React Native Starter',
    summary: '모바일 앱 스타터',
    category: '포트폴리오',
    tags: ['React Native', 'Expo'],
    thumbnail_url: '/mock/starter-kits/react-native-starter.png',
    description: 'Expo 기반으로 iOS/Android를 동시에 지원하는 모바일 앱 스타터입니다.',
    features: ['네비게이션 설정', '푸시 알림', '다크모드'],
    tech_stack: ['React Native', 'Expo', 'TypeScript'],
    preview_images: ['/mock/starter-kits/react-native-starter-1.png'],
    author_id: MOCK_AUTHOR_ID,
    created_at: '2026-07-25T09:00:00.000Z',
    updated_at: '2026-07-25T09:00:00.000Z',
  },
  {
    id: '3f9c1e6a-2b3a-4c1a-9c1a-000000000009',
    title: 'React Native Starter',
    summary: '크로스플랫폼 모바일 앱 스타터',
    category: '포트폴리오',
    tags: ['React Native', 'Expo'],
    thumbnail_url: '/mock/starter-kits/react-native-starter.png',
    description: 'Expo 기반으로 iOS/Android를 동시에 지원하는 모바일 앱 스타터입니다.',
    features: ['네비게이션 설정', '푸시 알림', '다크모드'],
    tech_stack: ['React Native', 'Expo', 'TypeScript'],
    preview_images: ['/mock/starter-kits/react-native-starter-1.png'],
    author_id: MOCK_AUTHOR_ID,
    created_at: '2026-07-25T09:00:00.000Z',
    updated_at: '2026-07-25T09:00:00.000Z',
  },
  {
    id: '3f9c1e6a-2b3a-4c1a-9c1a-000000000010',
    title: 'React Native Starter',
    summary: '크로스플랫폼 모바일 앱 스타터',
    category: '포트폴리오',
    tags: ['React Native', 'Expo'],
    thumbnail_url: '/mock/starter-kits/react-native-starter.png',
    description: 'Expo 기반으로 iOS/Android를 동시에 지원하는 모바일 앱 스타터입니다.',
    features: ['네비게이션 설정', '푸시 알림', '다크모드'],
    tech_stack: ['React Native', 'Expo', 'TypeScript'],
    preview_images: ['/mock/starter-kits/react-native-starter-1.png'],
    author_id: MOCK_AUTHOR_ID,
    created_at: '2026-07-25T09:00:00.000Z',
    updated_at: '2026-07-25T09:00:00.000Z',
  },
  {
    id: '3f9c1e6a-2b3a-4c1a-9c1a-000000000011',
    title: 'React Native Starter',
    summary: '크로스플랫폼 모바일 앱 스타터',
    category: '포트폴리오',
    tags: ['React Native', 'Expo'],
    thumbnail_url: '/mock/starter-kits/react-native-starter.png',
    description: 'Expo 기반으로 iOS/Android를 동시에 지원하는 모바일 앱 스타터입니다.',
    features: ['네비게이션 설정', '푸시 알림', '다크모드'],
    tech_stack: ['React Native', 'Expo', 'TypeScript'],
    preview_images: ['/mock/starter-kits/react-native-starter-1.png'],
    author_id: MOCK_AUTHOR_ID,
    created_at: '2026-07-25T09:00:00.000Z',
    updated_at: '2026-07-25T09:00:00.000Z',
  },
  {
    id: '3f9c1e6a-2b3a-4c1a-9c1a-000000000012',
    title: 'React Native Starter',
    summary: '크로스플랫폼 모바일 앱 스타터',
    category: '포트폴리오',
    tags: ['React Native', 'Expo'],
    thumbnail_url: '/mock/starter-kits/react-native-starter.png',
    description: 'Expo 기반으로 iOS/Android를 동시에 지원하는 모바일 앱 스타터입니다.',
    features: ['네비게이션 설정', '푸시 알림', '다크모드'],
    tech_stack: ['React Native', 'Expo', 'TypeScript'],
    preview_images: ['/mock/starter-kits/react-native-starter-1.png'],
    author_id: MOCK_AUTHOR_ID,
    created_at: '2026-07-25T09:00:00.000Z',
    updated_at: '2026-07-25T09:00:00.000Z',
  },
  {
    id: '3f9c1e6a-2b3a-4c1a-9c1a-000000000013',
    title: 'React Native Starter',
    summary: '크로스플랫폼 모바일 앱 스타터',
    category: '포트폴리오',
    tags: ['React Native', 'Expo'],
    thumbnail_url: '/mock/starter-kits/react-native-starter.png',
    description: 'Expo 기반으로 iOS/Android를 동시에 지원하는 모바일 앱 스타터입니다.',
    features: ['네비게이션 설정', '푸시 알림', '다크모드'],
    tech_stack: ['React Native', 'Expo', 'TypeScript'],
    preview_images: ['/mock/starter-kits/react-native-starter-1.png'],
    author_id: MOCK_AUTHOR_ID,
    created_at: '2026-07-25T09:00:00.000Z',
    updated_at: '2026-07-25T09:00:00.000Z',
  },
  {
    id: '3f9c1e6a-2b3a-4c1a-9c1a-000000000014',
    title: 'React Native Starter',
    summary: '크로스플랫폼 모바일 앱 스타터',
    category: '포트폴리오',
    tags: ['React Native', 'Expo'],
    thumbnail_url: '/mock/starter-kits/react-native-starter.png',
    description: 'Expo 기반으로 iOS/Android를 동시에 지원하는 모바일 앱 스타터입니다.',
    features: ['네비게이션 설정', '푸시 알림', '다크모드'],
    tech_stack: ['React Native', 'Expo', 'TypeScript'],
    preview_images: ['/mock/starter-kits/react-native-starter-1.png'],
    author_id: MOCK_AUTHOR_ID,
    created_at: '2026-07-25T09:00:00.000Z',
    updated_at: '2026-07-25T09:00:00.000Z',
  },
];
