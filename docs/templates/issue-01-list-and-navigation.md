# Issue 01 — Templates 전체 목록 조회 및 상세 페이지 이동

관련 PRD: [prd.md](./prd.md) · 확정 스펙: [spec-fixed.md](./spec-fixed.md) AC-01, AC-04

## 배경

`/templates` 라우트를 신설하고, 기존 `getStarterKits()`·`StarterKitCard`를 재사용해 전체 스타터 킷 목록을 최신순으로 보여준다. 카드를 클릭하면 요약 모달 없이 바로 상세 페이지(`/templates/[id]`)로 이동한다. 이 이슈만으로 "목록을 보고 상세로 진입"하는 완결된 사용자 동작이 성립하며, 카테고리 필터(Issue 02)와 무한스크롤(Issue 03)의 기반이 된다.

## 작업 범위

- `src/app/templates/page.tsx` 신설 — 서버 컴포넌트, `getStarterKits()` 호출, `updated_at` desc 정렬
- 기존 `StarterKitCard`(`src/features/starter-kit/ui/starter-kit-card.tsx`)를 재사용하되, `onSelect`를 모달 오픈이 아닌 `router.push(`/templates/${id}`)`로 연결하는 컨테이너 구성
- 그리드 반응형: 모바일 1열 / 태블릿 2열 / 데스크톱 3열, `gap-6`
- 전체 스타터 킷이 0개일 때 기존 `StarterKitEmptyState` 재사용
- `src/app/templates/[id]/page.tsx`(기존 placeholder)에 `<h1 tabIndex={-1}>` 추가 + 마운트 시 포커스 이동
- 썸네일 이미지 로드 실패 시 기존 `FallbackImage` 재사용

## 범위 밖

- 카테고리 필터 — Issue 02
- 무한스크롤 — Issue 03
- 상세 페이지 실제 콘텐츠 — PRD Out of Scope

## Acceptance Criteria

- [ ] Given 등록된 스타터 킷이 존재한다, When 사용자가 `/templates`에 접속한다, Then 전체 스타터 킷 카드 목록이 최신순으로 표시된다.
- [ ] Given 목록이 표시되고 있다, When 사용자가 카드를 클릭한다, Then 요약 모달 없이 바로 해당 스타터 킷의 `/templates/[id]` 페이지로 이동한다.
- [ ] Given 카드가 키보드 포커스를 받고 있다, When 사용자가 Enter 또는 Space를 누른다, Then 클릭과 동일하게 상세 페이지로 이동한다.
- [ ] Given 사용자가 카드 클릭으로 상세 페이지에 진입했다, When 페이지가 마운트된다, Then 포커스가 상세 페이지의 `<h1>`으로 이동한다.
- [ ] Given 등록된 스타터 킷이 전체 0개다, When 사용자가 `/templates`에 접속한다, Then 전역 빈 상태 UI가 표시된다.
- [ ] Given 모바일/태블릿/데스크톱 각 브레이크포인트다, When `/templates`를 확인한다, Then 그리드가 1열/2열/3열로 표시된다.

## 의존성

- 선행 이슈 없음(신규 라우트, 기존 컴포넌트 재사용)
- Issue 02, Issue 03의 전제 조건
