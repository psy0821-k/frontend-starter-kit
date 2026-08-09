-- ============================================================
-- 시딩 — 기존 mock 14건을 templates 테이블로 이관
-- ============================================================
-- 원본: src/features/starter-kit/api/mock-data.ts
--
-- 실행 전 준비:
--   1) 001_initial_schema.sql을 먼저 실행한다.
--   2) 앱에서 본인 계정으로 회원가입한다.
--   3) 아래 :author_id 를 본인 UUID로 치환한다.
--      SQL Editor에서 확인: select id, email from auth.users;
--   4) 본인 계정을 관리자로 승격한다:
--      update public.profiles set role = 'admin' where id = '<본인 UUID>';
--      (profiles 행이 없다면 먼저 insert — 가입 트리거는 아직 없다)
--
-- 주의: SQL Editor는 postgres 역할로 실행되어 RLS를 우회하므로 시딩에 적합하다.
--       애플리케이션 경로로는 관리자만 등록할 수 있다.
--
-- created_at에 대하여:
--   실제 등록 시각은 존재하지 않는 정보이므로 날조하지 않고 updated_at과
--   동일하게 채운다. now()를 쓰면 "2026-08-09 등록, 2026-07-20 수정"이라는
--   역전이 생겨 templates_updated_after_created 제약에 걸리고,
--   상세 페이지의 날짜 표시도 깨진다.
--   두 값이 같으면 상세 페이지는 "등록"만 노출한다(수정된 적 없음).
-- ============================================================

\set author_id '00000000-0000-0000-0000-000000000000'

insert into public.templates (
  id, title, summary, category, tags, thumbnail_url,
  description, features, tech_stack, preview_images,
  author_id, created_at, updated_at
) values
  (
    '3f9c1e6a-2b3a-4c1a-9c1a-000000000001',
    'Next.js SaaS Starter',
    '결제와 인증이 포함된 SaaS 랜딩 스타터',
    'erp',
    array['Next.js', 'Tailwind', 'Stripe'],
    '/mock/starter-kits/saas-starter.png',
    'SaaS 제품 런칭에 필요한 랜딩페이지, 요금제, 인증 플로우를 갖춘 스타터입니다.',
    array['소셜 로그인', '구독 결제', '반응형 랜딩'],
    array['Next.js', 'TypeScript', 'Tailwind CSS', 'Stripe'],
    array['/mock/starter-kits/saas-starter-1.png', '/mock/starter-kits/saas-starter-2.png'],
    :'author_id', '2026-08-01T09:00:00.000Z', '2026-08-01T09:00:00.000Z'
  ),
  (
    '3f9c1e6a-2b3a-4c1a-9c1a-000000000002',
    'Admin Dashboard Kit',
    '차트와 테이블이 포함된 관리자 대시보드',
    'erp',
    array['Dashboard', 'Chart', 'Table'],
    '/mock/starter-kits/admin-dashboard.png',
    '데이터 시각화와 CRUD 테이블을 갖춘 관리자용 대시보드 스타터입니다.',
    array['차트 위젯', '데이터 테이블', '다크모드'],
    array['Next.js', 'TypeScript', 'Recharts'],
    array['/mock/starter-kits/admin-dashboard-1.png'],
    :'author_id', '2026-07-28T09:00:00.000Z', '2026-07-28T09:00:00.000Z'
  ),
  (
    '3f9c1e6a-2b3a-4c1a-9c1a-000000000003',
    'Portfolio Starter',
    '개인 포트폴리오를 위한 미니멀 스타터',
    '포트폴리오',
    array['Portfolio', 'Minimal'],
    '/mock/starter-kits/portfolio.png',
    '프로젝트 목록과 자기소개를 담는 미니멀 포트폴리오 템플릿입니다.',
    array['프로젝트 갤러리', 'MDX 블로그', 'SEO 최적화'],
    array['Next.js', 'MDX', 'Tailwind CSS'],
    array['/mock/starter-kits/portfolio-1.png'],
    :'author_id', '2026-07-20T09:00:00.000Z', '2026-07-20T09:00:00.000Z'
  ),
  (
    '3f9c1e6a-2b3a-4c1a-9c1a-000000000004',
    'Express REST API Starter',
    '인증과 검증이 포함된 REST API 스타터',
    'erp',
    array['Express', 'REST', 'JWT'],
    '/mock/starter-kits/express-api.png',
    'JWT 인증과 요청 검증 미들웨어를 갖춘 REST API 서버 스타터입니다.',
    array['JWT 인증', '요청 검증', '에러 핸들링'],
    array['Express', 'TypeScript', 'Zod'],
    array['/mock/starter-kits/express-api-1.png'],
    :'author_id', '2026-07-30T09:00:00.000Z', '2026-07-30T09:00:00.000Z'
  ),
  (
    '3f9c1e6a-2b3a-4c1a-9c1a-000000000005',
    'NestJS Microservice Kit',
    '마이크로서비스 구조의 NestJS 스타터',
    'erp',
    array['NestJS', 'Microservice'],
    '/mock/starter-kits/nestjs-kit.png',
    '모듈 단위로 분리된 마이크로서비스 아키텍처 스타터입니다.',
    array['모듈 분리', 'gRPC 통신', 'Docker 설정'],
    array['NestJS', 'TypeScript', 'Docker'],
    array['/mock/starter-kits/nestjs-kit-1.png'],
    :'author_id', '2026-07-15T09:00:00.000Z', '2026-07-15T09:00:00.000Z'
  ),
  (
    '3f9c1e6a-2b3a-4c1a-9c1a-000000000006',
    'Full-stack E-commerce Kit',
    '프론트와 백엔드가 통합된 쇼핑몰 스타터',
    '쇼핑몰',
    array['E-commerce', 'Fullstack'],
    '/mock/starter-kits/ecommerce-kit.png',
    '상품 목록, 장바구니, 결제까지 포함된 풀스택 쇼핑몰 스타터입니다.',
    array['상품 관리', '장바구니', '결제 연동'],
    array['Next.js', 'Node.js', 'PostgreSQL'],
    array['/mock/starter-kits/ecommerce-kit-1.png', '/mock/starter-kits/ecommerce-kit-2.png'],
    :'author_id', '2026-08-03T09:00:00.000Z', '2026-08-03T09:00:00.000Z'
  ),
  (
    '3f9c1e6a-2b3a-4c1a-9c1a-000000000007',
    'React Native Starter',
    '크로스플랫폼 모바일 앱 스타터',
    '포트폴리오',
    array['React Native', 'Expo'],
    '/mock/starter-kits/react-native-starter.png',
    'Expo 기반으로 iOS/Android를 동시에 지원하는 모바일 앱 스타터입니다.',
    array['네비게이션 설정', '푸시 알림', '다크모드'],
    array['React Native', 'Expo', 'TypeScript'],
    array['/mock/starter-kits/react-native-starter-1.png'],
    :'author_id', '2026-07-25T09:00:00.000Z', '2026-07-25T09:00:00.000Z'
  ),
  -- 8~14번은 무한스크롤 동작 확인용으로 만든 채움 데이터다.
  -- 원본 mock의 12번 id는 마지막 그룹이 13자리('...0000000000012')라
  -- 유효한 UUID가 아니었으므로 여기서 '...000000000012'로 교정한다.
  (
    '3f9c1e6a-2b3a-4c1a-9c1a-000000000008',
    'React Native Starter', '모바일 앱 스타터', '포트폴리오',
    array['React Native', 'Expo'], '/mock/starter-kits/react-native-starter.png',
    'Expo 기반으로 iOS/Android를 동시에 지원하는 모바일 앱 스타터입니다.',
    array['네비게이션 설정', '푸시 알림', '다크모드'],
    array['React Native', 'Expo', 'TypeScript'],
    array['/mock/starter-kits/react-native-starter-1.png'],
    :'author_id', '2026-07-25T09:00:00.000Z', '2026-07-25T09:00:00.000Z'
  ),
  (
    '3f9c1e6a-2b3a-4c1a-9c1a-000000000009',
    'React Native Starter', '크로스플랫폼 모바일 앱 스타터', '포트폴리오',
    array['React Native', 'Expo'], '/mock/starter-kits/react-native-starter.png',
    'Expo 기반으로 iOS/Android를 동시에 지원하는 모바일 앱 스타터입니다.',
    array['네비게이션 설정', '푸시 알림', '다크모드'],
    array['React Native', 'Expo', 'TypeScript'],
    array['/mock/starter-kits/react-native-starter-1.png'],
    :'author_id', '2026-07-25T09:00:00.000Z', '2026-07-25T09:00:00.000Z'
  ),
  (
    '3f9c1e6a-2b3a-4c1a-9c1a-000000000010',
    'React Native Starter', '크로스플랫폼 모바일 앱 스타터', '포트폴리오',
    array['React Native', 'Expo'], '/mock/starter-kits/react-native-starter.png',
    'Expo 기반으로 iOS/Android를 동시에 지원하는 모바일 앱 스타터입니다.',
    array['네비게이션 설정', '푸시 알림', '다크모드'],
    array['React Native', 'Expo', 'TypeScript'],
    array['/mock/starter-kits/react-native-starter-1.png'],
    :'author_id', '2026-07-25T09:00:00.000Z', '2026-07-25T09:00:00.000Z'
  ),
  (
    '3f9c1e6a-2b3a-4c1a-9c1a-000000000011',
    'React Native Starter', '크로스플랫폼 모바일 앱 스타터', '포트폴리오',
    array['React Native', 'Expo'], '/mock/starter-kits/react-native-starter.png',
    'Expo 기반으로 iOS/Android를 동시에 지원하는 모바일 앱 스타터입니다.',
    array['네비게이션 설정', '푸시 알림', '다크모드'],
    array['React Native', 'Expo', 'TypeScript'],
    array['/mock/starter-kits/react-native-starter-1.png'],
    :'author_id', '2026-07-25T09:00:00.000Z', '2026-07-25T09:00:00.000Z'
  ),
  (
    '3f9c1e6a-2b3a-4c1a-9c1a-000000000012',
    'React Native Starter', '크로스플랫폼 모바일 앱 스타터', '포트폴리오',
    array['React Native', 'Expo'], '/mock/starter-kits/react-native-starter.png',
    'Expo 기반으로 iOS/Android를 동시에 지원하는 모바일 앱 스타터입니다.',
    array['네비게이션 설정', '푸시 알림', '다크모드'],
    array['React Native', 'Expo', 'TypeScript'],
    array['/mock/starter-kits/react-native-starter-1.png'],
    :'author_id', '2026-07-25T09:00:00.000Z', '2026-07-25T09:00:00.000Z'
  ),
  (
    '3f9c1e6a-2b3a-4c1a-9c1a-000000000013',
    'React Native Starter', '크로스플랫폼 모바일 앱 스타터', '포트폴리오',
    array['React Native', 'Expo'], '/mock/starter-kits/react-native-starter.png',
    'Expo 기반으로 iOS/Android를 동시에 지원하는 모바일 앱 스타터입니다.',
    array['네비게이션 설정', '푸시 알림', '다크모드'],
    array['React Native', 'Expo', 'TypeScript'],
    array['/mock/starter-kits/react-native-starter-1.png'],
    :'author_id', '2026-07-25T09:00:00.000Z', '2026-07-25T09:00:00.000Z'
  ),
  (
    '3f9c1e6a-2b3a-4c1a-9c1a-000000000014',
    'React Native Starter', '크로스플랫폼 모바일 앱 스타터', '포트폴리오',
    array['React Native', 'Expo'], '/mock/starter-kits/react-native-starter.png',
    'Expo 기반으로 iOS/Android를 동시에 지원하는 모바일 앱 스타터입니다.',
    array['네비게이션 설정', '푸시 알림', '다크모드'],
    array['React Native', 'Expo', 'TypeScript'],
    array['/mock/starter-kits/react-native-starter-1.png'],
    :'author_id', '2026-07-25T09:00:00.000Z', '2026-07-25T09:00:00.000Z'
  )
on conflict (id) do nothing;

-- 코드 뷰어를 즉시 확인할 수 있도록 1번 템플릿에만 샘플 파일을 넣는다.
-- 나머지 13건은 파일이 없는 상태이며, 상세 페이지는 이 경우도 견뎌야 한다.
insert into public.template_files (template_id, file_path, code, language, sort_order) values
  (
    '3f9c1e6a-2b3a-4c1a-9c1a-000000000001',
    'src/features/auth/model/schema.ts',
    E'import { z } from \'zod\';\n\nexport const loginSchema = z.object({\n  email: z.string().min(1, \'이메일을 입력해주세요\').email(\'올바른 이메일 형식이 아닙니다\'),\n  password: z.string().min(1, \'비밀번호를 입력해주세요\'),\n});\n\nexport type LoginFormValues = z.infer<typeof loginSchema>;\n',
    'typescript',
    0
  ),
  (
    '3f9c1e6a-2b3a-4c1a-9c1a-000000000001',
    'src/features/auth/ui/login-form.tsx',
    E'\'use client\';\n\nimport { useAppForm } from \'@/shared/lib/hooks/use-app-form\';\nimport { loginSchema } from \'../model/schema\';\n\nexport function LoginForm() {\n  const form = useAppForm(loginSchema, {\n    defaultValues: { email: \'\', password: \'\' },\n  });\n\n  return <form noValidate>{/* ... */}</form>;\n}\n',
    'tsx',
    1
  ),
  (
    '3f9c1e6a-2b3a-4c1a-9c1a-000000000001',
    'src/app/api/auth/login/route.ts',
    E'import { NextResponse } from \'next/server\';\nimport { loginSchema } from \'@/features/auth/model/schema\';\n\nexport async function POST(request: Request) {\n  const body = (await request.json()) as unknown;\n  const parsed = loginSchema.safeParse(body);\n\n  if (!parsed.success) {\n    return NextResponse.json(\n      { success: false, error: { code: \'VALIDATION_ERROR\', message: \'입력값을 다시 확인해주세요\' } },\n      { status: 400 }\n    );\n  }\n\n  return NextResponse.json({ success: true, data: null });\n}\n',
    'typescript',
    2
  )
on conflict (template_id, file_path) do nothing;
