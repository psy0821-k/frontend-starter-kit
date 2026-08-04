# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 현재 상태

**이 프로젝트는 아직 코드가 없는 기획 단계다 (S1 착수 전).** `src/`, `package.json` 등 실제 구현물은 존재하지 않으며, `plan/prd.md`(요구사항)와 `plan/plan.md`(기술 설계·로드맵), `frontend-review.md`(프론트엔드 관점 검토)만 있다.

- 구현이 시작되면(S1) 이 파일에 **빌드/린트/테스트 명령어**와 **실제 아키텍처**를 반드시 채워 넣을 것 — 지금은 계획 문서 기반 요약만 담고 있다.
- 작업 전 항상 `plan/prd.md`(무엇을·왜)와 `plan/plan.md`(어떻게)를 먼저 확인한다. 두 문서가 충돌하면 plan.md의 최신 결정을 따른다.

## 프로젝트 정의

Frontend Starter Platform — 포트폴리오/실무 프론트엔드 프로젝트를 반복해서 새로 시작할 때마다 구조·컴포넌트·문서·규칙을 다시 잡는 낭비를 없애기 위한, 여러 프로젝트가 공유하는 재사용 기반. 현재는 상용 서비스가 아니라 **본인이 쓸 Starter Platform 구축 + 포트폴리오 완성**이 목적이다 (`plan/prd.md` §1.5 우선순위 참조).

핵심 판단 기준: "코드가 동작하는가"가 아니라 **"다음 프로젝트에서도 그대로 쓸 수 있는가"**.

## 확정된 기술 스택

| 영역 | 선택 |
|---|---|
| 프레임워크 | Next.js 15 (App Router) |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS 4 |
| UI 컴포넌트 | shadcn/ui (코드 소유 방식, 원본 직접 수정 금지) |
| UI 상태 | Zustand (서버 상태는 담지 않음) |
| 서버 상태 | TanStack Query v5 |
| 폼 | React Hook Form + Zod |
| 테스트 | Vitest(유닛) + Playwright(E2E) + vitest-axe(접근성) |
| 린트/훅 | ESLint + Prettier + Husky + lint-staged |

**의도적으로 제외**: Redux(과설계), Storybook(1인 개발 비용 — `*.example.tsx`/데모 페이지 또는 대표 구현 참조로 대체), MSW(Route Handler 목업으로 대체), CSS-in-JS.

## 아키텍처 원칙

### 폴더 구조 (plan.md 기준, features 슬라이스 방식)
```
src/
├─ app/            # Next.js 라우팅 전용 — 로직 넣지 않음
├─ features/       # 도메인 수직 슬라이스 (예: order/api, order/model, order/ui)
├─ shared/         # shared-kernel: ui(얇은 래퍼)/lib/api/config
├─ components/ui/  # shadcn 원본 — 직접 수정 금지
```
의존 방향은 **단방향**: `app → features → shared` (역방향 import는 ESLint `import/no-restricted-paths`로 차단).

### 커널 승격 — "2회 규칙"
`shared`/`components/ui`로 코드를 올리는 기준은 "재사용 가능해 보임"이 아니라 **실제로 2번째 프로젝트(또는 2번째 사용처)에서 동일 요구가 재현되었을 때만**이다. 추측 기반 선제 구현 금지. 커널에 있지만 실제로 재사용되지 않는 코드는 주기적으로 강등(제거/도메인 이동) 검토 대상이다.

### 얇은 래퍼 규칙
shadcn 컴포넌트를 감싸는 래퍼는 **추가 동작(정책 주입)이 있을 때만** 만든다. 단순 재export는 안티패턴이며 삭제 대상이다.
- 작동하는 예: 로딩 중 자동 disable + 스피너 주입, `FormField`(label/error/aria 자동 연결), `AsyncBoundary`(loading/error/empty 3분기 통합)
- 작동하지 않는 예: `export { Input } from '@/components/ui/input'`

래퍼 코드가 원본 API보다 길어지면 과추상화 신호로 보고 재검토한다.

### API/인증
- Next.js Route Handler를 BFF로 사용, 인증 토큰은 httpOnly 쿠키로 관리한다.
- API 에러는 `ApiError` 클래스 + `types/api.ts`의 `ApiErrorCode` 유니온 타입(단일 진실 공급원)으로 표준화한다. 백엔드 에러 코드가 이 유니온과 다르면 BFF 계층에서 매핑해 흡수한다.
- 환경변수는 Zod로 부팅 시점에 검증한다.

### 컴포넌트 완료 정의 (P0, Definition of Done)
`components/ui`에 커밋되기 전 4개 기준을 모두 충족해야 한다: 타입 명시(props export, `any` 금지) · 접근성(role/aria/키보드 네비게이션) · 반응형 3단계(모바일/태블릿/데스크톱) · 사용 예제 1개.

## 네이밍 규칙
- 파일: kebab-case
- 컴포넌트/타입: PascalCase
- 변수/함수: camelCase
- 상수: UPPER_SNAKE_CASE

## AI 협업 구조
- 루트 및 `features/*`, `shared/ui` 등 주요 폴더에 폴더별 `CLAUDE.md`를 두어 로컬 컨텍스트(도메인 용어, 래퍼 생성 기준 등)를 제공한다.
- `*.example.tsx` 전용 예시 파일보다는, **각 폴더의 대표 구현 파일 하나를 폴더별 CLAUDE.md에서 직접 지목**하는 방식을 우선한다 (예시 파일이 실제 코드와 어긋나면 오히려 해로움 — `frontend-review.md` §4 참조).
- 새 컴포넌트/패턴을 만들기 전 "이미 있는 패턴이 있는가?"를 먼저 확인한다.

## 참고 문서
- [plan/prd.md](plan/prd.md) — 요구사항, 목표, 범위, 리스크
- [plan/plan.md](plan/plan.md) — 폴더 구조, 코드 패턴, 로드맵(S1~S7) 상세
- [frontend-review.md](frontend-review.md) — 프론트엔드 관점 검토 및 보완 필요 항목
