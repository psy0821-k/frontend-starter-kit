# Frontend Starter Platform

AI(Claude)와 함께 실무 프론트엔드 프로젝트를 빠르게 시작할 수 있도록, 디자인 시스템·컴포넌트·프로젝트 구조·문서·개발 규칙을 하나로 묶은 재사용 가능한 기반입니다.

## 🚀 빠른 시작

### 요구사항

- Node.js 18+

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 브라우저에서 http://localhost:3000 접속
```

## 📦 기술 스택

| 영역        | 선택                                    | 상태              |
| ----------- | --------------------------------------- | ----------------- |
| 프레임워크  | Next.js 15 (App Router)                 | 적용됨            |
| 언어        | TypeScript                              | 적용됨            |
| 스타일      | Tailwind CSS 4                          | 적용됨            |
| UI 컴포넌트 | shadcn/ui (코드 소유 방식)              | 적용됨            |
| UI 상태     | Zustand                                 | 적용됨            |
| 폼          | React Hook Form + Zod                   | 적용됨            |
| 인증/DB     | Supabase (Route Handler 경유 BFF)       | 적용됨            |
| 린트/훅     | ESLint + Prettier + Husky + lint-staged | 적용됨            |
| 테스트      | Vitest(유닛) + Playwright(E2E)          | 적용됨            |
| 서버 상태   | TanStack Query v5                       | 미설치, 계획 확정 |

## 📁 프로젝트 구조

```
src/
├── app/              # Next.js 라우팅 (starters/templates/features/auth 라우트 매핑)
├── features/         # 도메인 수직 슬라이스
├── shared/           # 공유 커널 (재사용 가능)
│   ├── ui/          # 얇은 래퍼 컴포넌트
│   ├── lib/         # 순수 유틸 및 훅
│   ├── api/         # API 클라이언트
│   └── config/      # 전역 설정
└── components/ui/   # shadcn/ui 원본 (수정 금지)
```

의존 방향은 **단방향**: `app → features → shared`

이 프로젝트는 **Starter + Template + Feature**를 조합해 다양한 프로젝트를 빠르게 구축하는 플랫폼입니다(상세: [docs/routing.md](docs/routing.md)).

- `starters/` — 프로젝트 시작점(예: portfolio, shopping, erp)
- `templates/` — 재사용 가능한 페이지 단위(예: login, dashboard, detail) — 목록·상세 구현됨
- `features/` — 페이지에 종속되지 않는 재사용 기능(예: search, board, comment) — 목록 구현됨
- `auth/` — 인증 전용 독립 영역(login, register, verify-email 등) — 진행 중

## 🛠️ 개발 명령어

```bash
# 개발 서버 실행
npm run dev

# 린트 검사
npm run lint

# 린트 자동 수정
npm run lint:fix

# 코드 포맷팅
npm run format

# 타입 검사
npm run type-check

# 유닛 테스트 실행
npm run test

# E2E 테스트 실행
npm run test:e2e

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start
```

## 📖 문서

- [CLAUDE.md](CLAUDE.md) — AI 협업 가이드 및 전역 규칙
- [plan/prd.md](plan/prd.md) — 제품 요구사항 및 목표
- [plan/plan.md](plan/plan.md) — 기술 설계 및 로드맵
- [plan/CODING_CONVENTION.md](plan/CODING_CONVENTION.md) — 코딩 스타일 상세 규칙
- [docs/routing.md](docs/routing.md) — 라우팅 구조, Starter/Template/Feature 역할
- [src/shared/CLAUDE.md](src/shared/CLAUDE.md) — Shared Kernel 가이드
- [src/features/CLAUDE.md](src/features/CLAUDE.md) — 도메인 개발 가이드

## 🔄 개발 흐름

### "2회 규칙"

코드를 `shared` 커널로 올리는 기준:

1. 첫 번째 프로젝트/기능에서만 필요 → `features/` 또는 `app/`에 남겨두기
2. 두 번째 프로젝트에서 동일 요구 재현 → 공통 부분을 `shared`로 이동

### AI와의 협업

- 새 컴포넌트를 만들기 전 "이미 있는가?" 먼저 확인
- `shared`에 올릴 때는 "다음 프로젝트에서도 쓸 수 있는가?" 증명
- 폴더별 `CLAUDE.md`를 항상 참고

## ✅ ESLint 의존성 규칙

자동으로 강제되는 규칙:

```
✅ shared → (자기 내부만)
✅ features → shared
✅ app → features, shared
❌ shared → features, app
❌ features → app
```

위반 시 린트 에러가 발생합니다.

## 📚 참고

- **현재 상태**: 기초 구조·린트·훅 설정 완료. `templates`(목록·상세, 카테고리 필터, 색상 대비 검증), `features`(목록) 구현됨. `auth`(Supabase 연동 기반, 회원가입/로그인 UI) 진행 중.
- **전체 로드맵**: [plan/plan.md §8](plan/plan.md#8-개발-로드맵-7-스프린트--14주)
