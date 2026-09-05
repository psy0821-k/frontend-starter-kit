# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 현재 상태

**기초 구조·린트·훅 설정 완료, 스타터킷 기능 구현 진행 중.** `src/`, `package.json` 등 실제 구현물이 존재하며, Next.js App Router 기반 구조와 Zustand, React Hook Form, Husky, ESLint/Prettier 설정이 갖춰져 있다.

- 작업 전 항상 `plan/prd.md`(무엇을·왜)와 `docs/routing.md`(라우팅 구조·역할)를 먼저 확인한다.
- 코딩 스타일 상세 규칙(파일명·네이밍·컴포넌트 작성·Hooks·스타일링·테스트 등)은 [plan/CODING_CONVENTION.md](plan/CODING_CONVENTION.md)를 참조한다. 이 CLAUDE.md는 프로젝트 정체성·아키텍처 원칙·AI 협업 규칙에 집중하고, 상세 컨벤션은 중복 서술하지 않는다.

## 프로젝트 정의

Frontend Starter Platform — 포트폴리오/실무 프론트엔드 프로젝트를 반복해서 새로 시작할 때마다 구조·컴포넌트·문서·규칙을 다시 잡는 낭비를 없애기 위한, 여러 프로젝트가 공유하는 재사용 기반. 현재는 상용 서비스가 아니라 **본인이 쓸 Starter Platform 구축 + 포트폴리오 완성**이 목적이다 (`plan/prd.md` §1.5 우선순위 참조).

핵심 판단 기준: "코드가 동작하는가"가 아니라 **"다음 프로젝트에서도 그대로 쓸 수 있는가"**.

## 기술 스택

| 영역        | 선택                                            | 상태                                                                                                                                       |
| ----------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 프레임워크  | Next.js 15 (App Router)                         | 적용됨                                                                                                                                     |
| 언어        | TypeScript                                      | 적용됨                                                                                                                                     |
| 스타일      | Tailwind CSS 4                                  | 적용됨                                                                                                                                     |
| UI 컴포넌트 | shadcn/ui (코드 소유 방식, 원본 직접 수정 금지) | 적용됨                                                                                                                                     |
| UI 상태     | Zustand (서버 상태는 담지 않음)                 | 적용됨                                                                                                                                     |
| 폼          | React Hook Form + Zod                           | 적용됨                                                                                                                                     |
| 린트/훅     | ESLint + Prettier + Husky + lint-staged         | 적용됨                                                                                                                                     |
| 서버 상태   | TanStack Query v5                               | 적용됨 (`src/app/query-provider.tsx`, bookmark 도메인에서 사용 — `src/features/bookmark/model/use-bookmark.ts`)                            |
| 테스트      | Vitest(유닛) + Playwright(E2E)                  | 적용됨 (vitest-axe 미도입, 접근성 검증은 Playwright E2E의 실제 렌더링 색상 기반 대비비 계산으로 수행 — `src/shared/lib/contrast-ratio.ts`) |

**의도적으로 제외**: Redux(과설계), Storybook(1인 개발 비용 — `*.example.tsx`/데모 페이지 또는 대표 구현 참조로 대체), MSW(Route Handler 목업으로 대체), CSS-in-JS.

## 자주 사용하는 명령어

| 명령어                | 용도                          |
| --------------------- | ----------------------------- |
| `npm run dev`         | 개발 서버 실행                |
| `npm run build`       | 프로덕션 빌드                 |
| `npm run lint`        | ESLint 검사 (경고 0개 강제)   |
| `npm run lint:fix`    | ESLint 자동 수정              |
| `npm run format`      | Prettier로 `src/**` 포맷팅    |
| `npm run type-check`  | `tsc --noEmit` 타입 검사      |
| `npm run test`        | Vitest 유닛 테스트 1회 실행   |
| `npm run test:watch`  | Vitest 유닛 테스트 watch mode |
| `npm run test:e2e`    | Playwright E2E 테스트 실행    |
| `npm run test:e2e:ui` | Playwright E2E 테스트 UI 모드 |

커밋 시 Husky + lint-staged가 `eslint --fix` / `prettier --write`를 자동 실행한다.

## 아키텍처 원칙

### 라우팅 구조 — Starter / Template / Feature

이 프로젝트는 하나의 완성된 웹사이트가 아니라, **Starter + Template + Feature를 조합해 다양한 프로젝트를 빠르게 구축하는 Frontend Starter Platform**이다. 세 개념은 서로 다른 역할을 가지며 혼합하지 않는다 (상세: [docs/routing.md](docs/routing.md)).

```
/                (목표 구조 — 아래 중 templates/[id]만 현재 구현됨)
├─ starters/    # 프로젝트의 시작점(Main). 예: portfolio, shopping, erp — 미구현
├─ templates/   # 재사용 가능한 페이지(UI) 단위. 예: login, dashboard, detail — [id] 상세 구현됨
├─ features/    # 특정 페이지에 종속되지 않는 재사용 가능한 기능. 예: search, board, comment — 미구현
├─ auth/        # 인증 전용 독립 영역. login, register, forgot-password, reset-password, verify-email — 미구현
└─ about/       # 프로젝트 소개 — 미구현
```

새 페이지/기능을 추가하기 전 아래 기준으로 분류한다:

- **Starter인가?** 프로젝트의 메인 화면·시작점이다.
- **Template인가?** 하나의 화면(UI)이고, 다른 프로젝트에서도 재사용 가능하다.
- **Feature인가?** 특정 기능 모듈이고, 여러 페이지에서 재사용 가능하다.

### 소스 폴더 구조 (features 슬라이스 방식)

```
src/
├─ app/            # Next.js 라우팅 전용 — 로직 넣지 않음 (starters/templates/features/auth 라우트 매핑)
├─ features/       # 도메인 수직 슬라이스 (예: starter-kit/api, starter-kit/model, starter-kit/ui)
├─ shared/         # shared-kernel: ui(얇은 래퍼)/lib/api/config
├─ components/ui/  # shadcn 원본 — 직접 수정 금지
```

의존 방향은 **단방향**: `app → features → shared` (역방향 import는 ESLint `import/no-restricted-paths`로 차단). 같은 규칙으로 `components/ui`(shadcn 원본)도 `app`/`features`/`shared/ui`에서 직접 import할 수 없게 막혀 있다 — 반드시 `shared/ui`에서 래핑해서 사용한다.

### 커널 승격 — "2회 규칙"

`shared`/`components/ui`로 코드를 올리는 기준은 "재사용 가능해 보임"이 아니라 **실제로 2번째 프로젝트(또는 2번째 사용처)에서 동일 요구가 재현되었을 때만**이다. 추측 기반 선제 구현 금지. 커널에 있지만 실제로 재사용되지 않는 코드는 주기적으로 강등(제거/도메인 이동) 검토 대상이다.

### 얇은 래퍼 규칙

shadcn 컴포넌트를 감싸는 래퍼는 **추가 동작(정책 주입)이 있을 때만** 만든다. 단순 재export는 안티패턴이며 삭제 대상이다.

- 작동하는 예: 로딩 중 자동 disable + 스피너 주입, `FormField`(label/error/aria 자동 연결), `AsyncBoundary`(loading/error/empty 3분기 통합)
- 작동하지 않는 예: `export { Input } from '@/components/ui/input'`

래퍼 코드가 원본 API보다 길어지면 과추상화 신호로 보고 재검토한다.

### API/인증

- Next.js Route Handler를 BFF로 사용, 인증 토큰은 httpOnly 쿠키로 관리한다.
- API 에러는 `ApiError` 클래스(`src/shared/api/error.ts`) + `src/types/api.ts`의 `ApiErrorCode` 유니온 타입(단일 진실 공급원)으로 표준화한다. 백엔드 에러 코드가 이 유니온과 다르면 BFF 계층에서 매핑해 흡수한다.
- 환경변수는 Zod로 부팅 시점에 검증한다 (`src/shared/config/env.ts`).

### 컴포넌트 완료 정의 (P0, Definition of Done)

`components/ui`에 커밋되기 전 4개 기준을 모두 충족해야 한다: 타입 명시(props export, `any` 금지) · 접근성(role/aria/키보드 네비게이션) · 반응형 3단계(모바일/태블릿/데스크톱) · 사용 예제 1개.

## 코드 품질 원칙

- `any` 사용 금지 (ESLint로 강제, `unknown` + 타입 가드 사용)
- 함수는 하나의 책임만 가진다
- DRY, YAGNI, SOLID 원칙을 고려하되 과설계는 지양한다
- 네이밍: 파일 kebab-case / 컴포넌트·타입 PascalCase / 변수·함수 camelCase / 상수 UPPER_SNAKE_CASE
- 상세 규칙(부울 변수, 이벤트 핸들러, 제네릭, 스타일링, 테스트 등)은 [plan/CODING_CONVENTION.md](plan/CODING_CONVENTION.md) 참조

## AI 협업 규칙

- 루트 및 주요 폴더에 폴더별 `CLAUDE.md`를 두어 로컬 컨텍스트(도메인 용어, 래퍼 생성 기준 등)를 제공한다. 현재 존재하는 폴더별 CLAUDE.md:
  - `src/shared/CLAUDE.md`
  - `src/shared/ui/CLAUDE.md`
  - `src/shared/api/CLAUDE.md`
  - `src/features/CLAUDE.md`
- `*.example.tsx` 전용 예시 파일보다는, **각 폴더의 대표 구현 파일 하나를 폴더별 CLAUDE.md에서 직접 지목**하는 방식을 우선한다 (예시 파일이 실제 코드와 어긋나면 오히려 해로움).
- 새 컴포넌트/패턴을 만들기 전 "이미 있는 패턴이 있는가?"를 먼저 확인한다.
- **요청받은 작업만 진행하고, 다음 단계는 추론해서 넘어가지 않는다.** 예를 들어 "spec-fixed 문서를 작성해줘"라는 요청은 문서 작성으로 끝나야 하며, 이어서 기능 구현·테스트까지 임의로 진행하지 않는다. 다음 단계가 필요해 보이면 먼저 제안하고 사용자의 명시적 승인을 기다린다.
- 요청받지 않은 리팩토링을 하지 않는다. 변경이 필요한 코드만 제안한다.
- 작업 전 관련 파일만 확인한다. 전체 프로젝트 분석은 명시적으로 요청받았을 때만 수행한다.

## 요구사항 요약 (상세: plan/prd.md)

- **목표**: 랜딩/포트폴리오/쇼핑몰/ERP 등 다양한 프로젝트 유형에서 공통 재사용 가능한 구조·컴포넌트·문서·규칙 기반을 구축한다.
- **범위(MVP, S1~S4)**: 기초 구조·린트/훅, P0 컴포넌트 12종 + DoD, Zustand/TanStack Query/RHF+Zod 공통 패턴, API 클라이언트·인증·에러 표준화, 포트폴리오 실적용까지.
- **비목표**: 상용 배포/과금, npm 패키지·CLI 스캐폴딩화, 커스텀 백엔드 서버, 크로스 브라우저 전수 대응 — 현 단계에서 다루지 않는다.
- **주요 리스크**: 범위 확산(→ "2회 규칙"으로 방지) · 과추상화(→ 래퍼가 원본보다 길어지면 재검토) · 검증 없는 자산화(→ 포트폴리오 실적용 병행).

## 참고 문서

- [docs/routing.md](docs/routing.md) — 라우팅 구조, Starter/Template/Feature 역할 및 구현 원칙
- [plan/CODING_CONVENTION.md](plan/CODING_CONVENTION.md) — 코딩 스타일 상세 규칙 (파일명, 네이밍, 컴포넌트, Hooks, 스타일링, 테스트 등)

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
