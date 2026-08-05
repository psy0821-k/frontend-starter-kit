# 랜딩페이지 PRD

**상태**: 핵심 기능(카드 목록·요약 모달)은 구현 완료. 본 문서는 구현된 결과를 기준으로 요구사항을 정리하고, 디자인 규칙 적용 여부를 검증하며, 남은 작업을 이슈로 분할하기 위한 단일 기준 문서다.

원본: [spec.md](./spec.md) · 확정 스펙: [spec-fixed.md](./spec-fixed.md)

---

## 개요

랜딩페이지는 Frontend Starter Platform의 진입점으로, 등록된 스타터 킷을 카테고리별 섹션(최대 6개)으로 보여주고, 카드 클릭 시 요약 모달로 핵심 정보(소개·주요 기능·기술 스택·미리보기 이미지)를 빠르게 확인할 수 있게 한다. "자세히 보기"는 스타터 킷 상세 페이지(`/templates/[id]`)로 연결된다.

## 사용자 스토리

1. 방문자는 랜딩페이지에 접속하면 카테고리별로 정리된 스타터 킷 카드를 즉시 볼 수 있다.
2. 방문자는 카드를 클릭(또는 Tab+Enter/Space)해 요약 모달을 열고, 페이지 이동 없이 핵심 정보를 확인한다.
3. 방문자는 모달의 "자세히 보기"를 눌러 상세 페이지로 이동한다.
4. 특정 카테고리에 스타터 킷이 없으면 해당 섹션은 노출되지 않고, 전체가 0개면 빈 상태 UI를 본다.
5. 방문자는 모바일/태블릿/데스크톱 어떤 화면에서도, 라이트/다크 어떤 테마에서도 동일한 정보 위계로 콘텐츠를 확인한다.

## 현재 구현 현황

| 영역                           | 구현 위치                                                                                | 상태                                            |
| ------------------------------ | ---------------------------------------------------------------------------------------- | ----------------------------------------------- |
| 데이터 타입/mock               | `src/features/starter-kit/model/types.ts`, `api/mock-data.ts`, `api/get-starter-kits.ts` | 완료                                            |
| 카테고리별 그룹핑              | `src/features/starter-kit/model/group-by-category.ts`                                    | 완료                                            |
| 카드 UI                        | `src/features/starter-kit/ui/starter-kit-card.tsx`                                       | 완료 (button 렌더링, focus-visible, 태그 3개+N) |
| 섹션(카테고리별 그리드)        | `src/features/starter-kit/ui/starter-kit-section.tsx`                                    | 완료 (1열→2열→3열 반응형)                       |
| 목록 컨테이너                  | `src/features/starter-kit/ui/starter-kit-list.tsx`                                       | 완료                                            |
| 요약 모달                      | `src/features/starter-kit/ui/starter-kit-summary-modal.tsx`                              | 완료 (shadcn Dialog)                            |
| 미리보기 캐러셀                | `src/features/starter-kit/ui/preview-image-carousel.tsx`                                 | 완료 (1장이면 네비게이션 숨김)                  |
| 빈 상태 UI                     | `src/features/starter-kit/ui/starter-kit-empty-state.tsx`                                | 완료                                            |
| 이미지 로드 실패 대체          | `src/shared/ui/fallback-image.tsx`                                                       | 완료                                            |
| 다크모드 CSS 변수              | `src/app/globals.css`                                                                    | 토큰 정의됨                                     |
| 상세 페이지(`/templates/[id]`) | `src/app/templates/[id]/page.tsx`                                                        | 라우트만 존재, UI 미구현(스코프 외)             |

## 기술 결정

### 데이터 페칭 및 상태 관리

**Context** — 랜딩페이지는 정적 mock 데이터로 시작하되, 추후 Supabase 연동 시 호출부 변경 없이 내부만 교체할 수 있어야 한다(spec-fixed.md).

**Decision** — `getStarterKits()` 함수(`features/starter-kit/api/get-starter-kits.ts`)가 데이터 소스를 감싸고, 서버 컴포넌트(`app/page.tsx`)에서 직접 호출해 카드+모달에 필요한 모든 필드를 한 번에 가져온다. 클라이언트 상태(Zustand)나 서버 상태 라이브러리(TanStack Query)는 사용하지 않는다.

**Alternatives**

- TanStack Query 도입: 현재는 클라이언트 사이드 리페칭·캐싱이 필요 없는 정적 목록이라 과설계(YAGNI 위반). Supabase 연동 시점에 재검토.
- Zustand로 모달 상태 관리: 모달 열림 상태는 `starter-kit-list.tsx` 내부 로컬 상태로 충분한 단일 페이지 상호작용이라 전역 상태가 불필요.

**Consequences** — 장점: 의존성 최소화, 서버 컴포넌트로 초기 로드 성능 확보. 단점: 추후 클라이언트 사이드 필터/정렬 등이 추가되면 상태 관리 방식을 다시 검토해야 한다.

### 모달 구현 방식

**Context** — 요약 정보를 페이지 이동 없이 보여줘야 하며, 모바일/데스크톱 공통 컴포넌트가 필요하다.

**Decision** — shadcn Dialog를 사용한다.

**Alternatives** — Sheet(사이드 패널)는 기각. 모바일에서 전체 화면을 가리는 방식이 Dialog와 사실상 동일한 경험을 주면서 별도 반응형 분기가 필요해 구현 비용만 늘어난다.

**Consequences** — 장점: 포커스 트랩·ESC·`aria-modal`이 기본 내장되어 접근성 요구사항을 별도 구현 없이 충족. 단점: 모달 내 콘텐츠가 길어지면(예: 기술 스택이 매우 많은 경우) 스크롤 UX를 추가로 검증해야 한다.

## 디자인 규칙 적용

[docs/design/](../design/index.md) 공통 가이드를 landing에 적용한 값이다.

```yaml
page:
  purpose: 등록된 스타터 킷을 카테고리별로 탐색하고 핵심 정보를 빠르게 확인한다
  target_user: Frontend Starter Platform을 활용해 새 프로젝트를 시작하려는 개발자(1차: 본인)
  industry: Content # 목록 탐색 + 정보 확인 중심, 가독성 우선
  design_style: Minimalism
  layout_pattern: Bento Grid # 카드 단위 정보, 빠른 탐색 목적과 일치 (spec-fixed.md 카드 그리드 구조)
  color_direction: Content 방향 — 뉴트럴 컬러, 배경/텍스트 대비 확보(가독성 우선), 배경에 강한 색 사용 금지
  theme: light # 기본 노출, dark 토큰은 globals.css에 정의되어 있음(§검증 참조)
  motion_level: none # 카드/모달 전환에 별도 커스텀 애니메이션 없음, shadcn 기본 트랜지션만 사용
```

### 디자인 규칙 대비 검증 결과

| 규칙                                           | 기준                                              | 현재 구현                                                                    | 판정                                      |
| ---------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------- |
| [accessibility.md](../design/accessibility.md) | 본문 대비 4.5:1 이상                              | shadcn 기본 토큰 사용, 별도 커스텀 색상 없음                                 | 코드상 위반 없음(육안 검증 필요 — 이슈화) |
| [accessibility.md](../design/accessibility.md) | Keyboard Navigation, Focus State                  | 카드 `button` + `focus-visible:outline`, Dialog 기본 포커스 트랩             | 충족                                      |
| [accessibility.md](../design/accessibility.md) | 색상만으로 상태 표현 금지                         | 카테고리/태그는 텍스트 병행(Badge 컴포넌트), 색상 단독 사용 없음             | 충족                                      |
| [accessibility.md](../design/accessibility.md) | 본문 16px 미만 금지                               | 업데이트 날짜(`text-xs`)가 12px 추정                                         | **위반 가능성 — 검증 필요(이슈화)**       |
| [layout.md](../design/layout.md)               | Bento Grid는 카드 단위, 반응형                    | 1열/2열/3열 그리드 구현                                                      | 충족                                      |
| [visual-style.md](../design/visual-style.md)   | Glassmorphism 금지                                | 미사용                                                                       | 충족                                      |
| [visual-style.md](../design/visual-style.md)   | `prefers-reduced-motion` 대응                     | motion_level: none이라 해당 없음                                             | 해당 없음                                 |
| [color.md](../design/color.md)                 | 라이트/다크 별도 검증(반전 아님)                  | 다크 토큰은 정의되어 있으나 랜딩페이지 화면 단위 육안 검증 기록 없음         | **미검증 — 이슈화**                       |
| [typography.md](../design/typography.md)       | Content 유형 본문 16px 이상, line-height 1.6 이상 | 제목/설명은 shadcn CardTitle/CardDescription 기본값 사용, line-height 미검증 | **미검증 — 이슈화**                       |

## Out of Scope

- Templates 메뉴(전체 목록, 무한스크롤, 카테고리 필터) — spec-fixed.md에서 이미 제외, 별도 기능 정의서로 분리
- 스타터 킷 상세 페이지(`/templates/[id]`)의 실제 UI 구현 — 라우트만 확보된 상태 유지
- Supabase 실제 연동 — mock 데이터의 필드 스키마만 대비, 실 연동은 후속 스코프
- 다크모드 토글 UI 자체(테마 전환 버튼) — globals.css 토큰 존재 여부만 이번 스코프에서 검증하며, 토글 UI/시스템 설정 연동은 별도 기능
- 카드 정렬/필터/검색 기능 — spec-fixed.md 범위 밖
- 신규 색상·타이포 값 정의 — `docs/design/color.md`, `docs/design/typography.md`의 기존 방향을 landing에 적용/검증만 하며, 공통 가이드 자체를 수정하지 않음

## 용어 정의

spec-fixed.md와 동일하게 사용한다.

| 용어                  | 정의                                                                 |
| --------------------- | -------------------------------------------------------------------- |
| 스타터 킷(StarterKit) | 랜딩페이지에 카드로 노출되는 재사용 가능한 프로젝트 시작점 단위      |
| 섹션                  | 카테고리 하나에 대응하는 카드 그리드 묶음                            |
| 요약 모달             | 카드 클릭 시 열리는, 상세 페이지 이동 전 핵심 정보를 보여주는 Dialog |

## 관련 문서

- [spec-fixed.md](./spec-fixed.md) — 확정 요구사항, 데이터 구조, 엣지케이스
- [docs/design/index.md](../design/index.md) — 공통 디자인 규칙 허브
