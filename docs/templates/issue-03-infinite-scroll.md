# Issue 03 — 클라이언트 측 무한스크롤

관련 PRD: [prd.md](./prd.md) "무한스크롤 구현 경계" ADR · 확정 스펙: [spec-fixed.md](./spec-fixed.md) AC-03, AC-06, AC-07

## 배경

Issue 01(목록)과 Issue 02(필터) 위에, 스크롤에 따라 9개 단위로 점진 노출하는 클라이언트 측 무한스크롤을 추가한다. 필터가 바뀌면 노출 개수는 9개로 초기화된다. 이 이슈를 끝으로 `/templates` MVP 사용자 스토리가 모두 완성된다.

## 작업 범위

- `src/features/starter-kit/lib/use-infinite-scroll.ts` — `IntersectionObserver` 래핑 범용 훅. `{ sentinelRef, onIntersect }`를 받아 교차 시 콜백만 호출(페이지 크기 정책을 모르는 순수 관찰 훅)
- `src/features/starter-kit/ui/starter-kit-infinite-list.tsx` — 목록 컨테이너로 승격
  - `visibleCount` 상태(9 단위 증가)를 관리하고 `use-infinite-scroll`의 콜백에서 9씩 증가
  - Issue 02의 필터 값이 바뀌면 `visibleCount`를 9로 리셋 + 스크롤 위치 상단 복귀
  - 전체 항목이 9개 이하면 sentinel/로딩 UI 없이 즉시 전부 표시
  - sentinel 요소는 `<div>`로 두고 `tabIndex` 부여하지 않음(포커스 가능한 빈 요소 금지)
- 로딩 인디케이터: 스켈레톤 카드 9슬롯(스피너 대신) — 레이아웃 시프트 방지
- Issue 02에서 마련한 `aria-live="polite"` 영역을 재사용해 로딩 시작/완료 문구 갱신("추가 스타터 킷을 불러오는 중입니다" / "N개의 스타터 킷을 추가로 불러왔습니다")
- 로딩 완료 후 포커스는 이동시키지 않음(PRD ADR 근거)

## 범위 밖

- 서버 사이드 페이지네이션 API — PRD Out of Scope, `use-infinite-scroll`은 관찰만 하고 정책을 모르므로 추후 전환 시 이 훅은 재사용 가능

## Acceptance Criteria

- [ ] Given 전체(또는 필터링된) 스타터 킷이 9개를 초과한다, When 사용자가 목록 하단까지 스크롤한다, Then 다음 9개 항목이 추가로 로딩되어 노출된다.
- [ ] Given 전체 항목이 9개 이하다, When `/templates`를 확인한다, Then sentinel이나 로딩 UI 없이 전부 한 번에 표시된다.
- [ ] Given 카테고리 필터가 적용된 상태로 스크롤을 내려 일부 항목을 로딩했다, When 사용자가 다른 카테고리로 필터를 변경한다, Then 노출 개수가 9개로 초기화되고 새 카테고리 기준으로 다시 나열된다.
- [ ] Given 추가 항목이 로딩 중이다, When 스크린리더로 확인한다, Then `aria-live` 영역에서 로딩 시작/완료 안내를 들을 수 있다.
- [ ] Given 추가 로딩이 완료됐다, When 새 카드가 DOM에 추가된다, Then 사용자의 현재 포커스/스크롤 위치가 임의로 이동하지 않는다.
- [ ] Given 키보드로 Tab을 반복해 목록을 순회한다, When sentinel 위치에 도달한다, Then sentinel 자체는 포커스되지 않고 다음 카드로 자연스럽게 넘어간다.
- [ ] Given 더 로드할 항목이 남아있지 않다, When 마지막 항목까지 노출됐다, Then sentinel과 로딩 인디케이터가 제거된다.

## 의존성

- Issue 01, Issue 02 완료 후 진행(목록 컨테이너와 필터 상태 전제)
