# Issue 02 — 카테고리 필터(단일 선택)

관련 PRD: [prd.md](./prd.md) "카테고리 필터 상태관리" ADR, "카테고리 필터 UI의 접근성 시맨틱" ADR · 확정 스펙: [spec-fixed.md](./spec-fixed.md) AC-02, AC-05

## 배경

Issue 01에서 완성된 전체 목록 위에, 카테고리 칩(All + `STARTER_KIT_CATEGORIES`) 단일 선택 필터를 추가한다. 필터 상태는 URL 쿼리스트링(`?category=`)으로 관리해 새로고침·뒤로가기에도 유지되며, 선택한 카테고리에 항목이 없으면 필터 전용 빈 상태 메시지를 보여준다.

## 작업 범위

- `src/features/starter-kit/model/filter-by-category.ts` — 카테고리 필터링 순수 함수
- `src/features/starter-kit/ui/starter-kit-category-filter.tsx` — 칩 UI, 클라이언트 컴포넌트
  - `<div role="group" aria-label="카테고리 필터">` + `<button aria-pressed>` 시맨틱 (PRD ADR 참조)
  - 선택 칩: 배경 채움(solid) / 비선택 칩: outline — 색상+형태 이중 구분
  - 모바일: 가로 스크롤 한 줄(`overflow-x-auto`)
  - `useRouter().push(pathname + '?category=...', { scroll: false })` + `useSearchParams()`로 URL 동기화
- `src/app/templates/page.tsx` 수정 — `searchParams: Promise<{ category?: string }>`로 초기 필터값을 받아 SSR 시점 반영
- 필터 값 타입 가드: `useSearchParams()`의 `string | null`을 `StarterKitCategory | 'all'`로 검증, 허용되지 않는 값은 `'all'` 폴백
- `src/features/starter-kit/ui/starter-kit-filtered-empty-state.tsx` 신설 — 선택 카테고리에 결과가 없을 때 전용 메시지(전역 빈 상태와 문구 구분)
- 필터/결과 변경 안내용 `role="status" aria-live="polite"` 영역 추가(Issue 03의 로딩 안내와 공유되는 컨테이너를 이 이슈에서 먼저 마련)

## 범위 밖

- 무한스크롤 — Issue 03
- 다중 선택 필터 — PRD Out of Scope

## Acceptance Criteria

- [ ] Given 목록이 표시되고 있다, When 사용자가 카테고리 필터 칩을 선택한다, Then 해당 카테고리의 스타터 킷만 표시되고 URL이 `?category=`로 갱신된다.
- [ ] Given `?category=Frontend`로 직접 접속한다, When 페이지가 로드된다, Then 초기 렌더부터 Frontend 카테고리만 필터링되어 표시된다(깜빡임 없음).
- [ ] Given 필터가 적용된 상태다, When 사용자가 새로고침하거나 뒤로가기를 한다, Then 필터 상태가 유지된다.
- [ ] Given 카테고리 필터가 "All"이 아닌 특정 카테고리로 선택되어 있다, When 해당 카테고리에 스타터 킷이 하나도 없다, Then 필터 전용 빈 상태 메시지가 표시된다(전역 빈 상태 UI와 다른 문구).
- [ ] Given 필터 칩이 키보드 포커스를 받고 있다, When Tab으로 이동하고 Enter/Space를 누른다, Then 마우스 클릭과 동일하게 필터가 적용된다.
- [ ] Given 필터를 변경했다, When 스크린리더로 확인한다, Then `aria-live` 영역을 통해 "{카테고리명} 카테고리, 총 N개" 형태로 결과가 안내된다.
- [ ] Given 선택/비선택 칩이 라이트·다크 테마 각각에서 렌더링된다, When 대비를 측정한다, Then 텍스트-배경 대비가 4.5:1 이상이다.

## 의존성

- Issue 01 완료 후 진행(목록 컨테이너 존재 전제)
- Issue 03과 상호작용(필터 변경 시 무한스크롤 노출 개수 리셋) — Issue 03에서 이어받음
