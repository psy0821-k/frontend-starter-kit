# Issue 04 — 실시간 검색(제목/태그, 디바운스)

관련 PRD: [prd.md](./prd.md) "검색 상태관리" ADR · 확정 스펙: [spec-fixed.md](./spec-fixed.md) AC-09~AC-12

## 배경

Issue 01(목록)·02(카테고리 필터)·03(무한스크롤) 위에, 제목/태그를 대상으로 하는 실시간 검색을 추가한다. 검색어는 로컬 상태로 즉시 입력에 반응하고, 300ms 디바운스 후에만 URL(`?q=`)과 목록에 반영된다. 카테고리 필터와 AND 조건으로 결합되며, 이 이슈로 `/templates`의 탐색 기능이 완성된다.

## 작업 범위

- `src/components/ui/input.tsx` — shadcn `Input` 신설(CLI로 추가, 원본 그대로 사용)
- `src/shared/lib/hooks/use-debounced-value.ts` — 범용 디바운스 훅(300ms)
- `src/features/starter-kit/model/filter-by-search.ts` — 제목/태그 대소문자 무시 부분 일치 순수 함수
- `src/features/starter-kit/ui/starter-kit-search-input.tsx` — 검색 입력 UI(클라이언트)
  - 로컬 `useState`로 즉시 입력 반영
  - `useDebouncedValue` 통과 후 `router.replace(pathname + '?...', { scroll: false })`로 URL(`?q=`) 갱신(`push`가 아닌 `replace`로 히스토리 오염 방지)
  - 검색 아이콘은 `aria-hidden`, 입력 필드에 `aria-label="스타터 킷 검색"`
- `src/app/templates/page.tsx` 수정 — `searchParams`에 `q` 추가, 검색 입력 렌더링
- `src/features/starter-kit/ui/starter-kit-infinite-list.tsx` 수정 — 카테고리 필터링 결과에 검색 필터링을 이어서 적용(AND), 검색어 변경 시에도 노출 개수 9개로 리셋 + `aria-live` 안내 문구에 검색어 포함
- `src/features/starter-kit/ui/starter-kit-filtered-empty-state.tsx` 수정 — 문구를 카테고리 전용에서 카테고리·검색 공용으로 일반화

## 범위 밖

- 검색 대상 확장(summary, tech_stack) — 제목/태그로 한정
- 검색어 하이라이트(일치 부분 강조 표시)
- 서버 사이드 검색 API — 클라이언트 필터링으로 대체

## Acceptance Criteria

- [ ] Given 목록이 표시되고 있다, When 사용자가 검색창에 제목 또는 태그와 일치하는 검색어를 입력하고 300ms 이상 기다린다, Then 검색어와 일치하는 스타터 킷만 표시되고 URL에 `?q=`가 반영된다.
- [ ] Given 사용자가 검색어를 입력 중이다(300ms 디바운스 대기 중), When 입력 직후 시점을 확인한다, Then URL과 목록은 아직 갱신되지 않고 입력 필드의 값만 즉시 갱신된다.
- [ ] Given 카테고리 필터와 검색어가 함께 적용되어 있다, When 두 조건을 모두 만족하는 스타터 킷이 하나도 없다, Then 필터 전용 빈 상태 메시지가 표시된다.
- [ ] Given 검색어가 적용된 상태로 스크롤을 내려 일부 항목을 로딩했다, When 사용자가 검색어를 변경한다, Then 노출 개수가 9개로 초기화되고 새 검색어 기준으로 다시 나열된다.
- [ ] Given `?q=react`로 직접 접속한다, When 페이지가 로드된다, Then 초기 렌더부터 검색어가 반영된 결과가 표시된다.
- [ ] Given 검색어를 여러 번 빠르게 수정한다, When 브라우저 뒤로가기를 누른다, Then 검색 중간값들이 히스토리에 쌓이지 않아 한 번에 검색 이전 화면으로 돌아간다(`replace` 사용 확인).
- [ ] Given 검색창이 키보드 포커스를 받고 있다, When 스크린리더로 확인한다, Then `aria-label`을 통해 "스타터 킷 검색"으로 안내된다.

## 의존성

- Issue 01, Issue 02, Issue 03 완료 후 진행(목록 컨테이너, 카테고리 필터 상태, 무한스크롤 노출 개수 관리 전제)
