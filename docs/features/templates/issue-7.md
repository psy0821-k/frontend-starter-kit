# Issue #7 — [templates] 클라이언트 측 무한스크롤

관련 문서: `docs/templates/prd.md` "무한스크롤 구현 경계" ADR · `docs/templates/spec-fixed.md` AC-03, AC-06, AC-07
선행 문서(동일 내용, 다른 슬라이스 기준): `docs/templates/issue-03-infinite-scroll.md`

## 시그니처

> 대상 두 파일은 이미 구현되어 있다(`git log` 기준 커밋 `9806545 templates 전체 목록 페이지 구현: 카테고리
필터·실시간 검색·무한스크롤`, `feature/templates` 라인). 새 패턴을 발명하지 않고 기존 구현을 시그니처로 그대로 확정한다.
> 단, 이 두 파일에는 아직 테스트 파일이 없다(`starter-kit-card.test.tsx`, `filter-by-category.test.ts`,
> `filter-by-search.test.ts`만 존재) — 이번 이슈의 TDD 대상은 "동작을 새로 만드는 것"이 아니라
> "기존 동작을 테스트로 고정하는 것"이다.

### `use-infinite-scroll.ts`

```typescript
interface UseInfiniteScrollOptions {
  /** 교차 여부를 관찰할 sentinel 요소의 ref */
  sentinelRef: RefObject<HTMLElement | null>;
  /** sentinel이 뷰포트에 교차했을 때 호출할 콜백 */
  onIntersect: () => void;
  /** 관찰 활성화 여부 (예: 더 로드할 항목이 없으면 false) */
  enabled: boolean;
}

function useInfiniteScroll(options: UseInfiniteScrollOptions): void;
```

- 순수 관찰 훅. "몇 개씩 늘릴지"·"언제 리셋할지" 정책을 모른다(정책은 호출부인
  `StarterKitInfiniteList`가 가진다).
- `enabled: false`이거나 `sentinelRef.current`가 없으면 `IntersectionObserver`를 생성하지 않는다.
- 반환값 없음(side-effect 전용 훅). 에러 케이스 없음 — 관찰 대상이 없으면 조용히 no-op.

### `starter-kit-infinite-list.tsx`

```typescript
interface StarterKitInfiniteListProps {
  starterKits: StarterKit[];
  selectedCategory: StarterKitCategoryFilter; // 'all' | StarterKitCategory
  searchQuery: string;
}

function StarterKitInfiniteList(props: StarterKitInfiniteListProps): JSX.Element;
```

- `PAGE_SIZE = 9`, `SKELETON_COUNT = 9` (모듈 상수).
- 내부 상태: `visibleCount`(초기값 `PAGE_SIZE`), `isLoadingMore`, `statusMessage`.
- 필터링 파이프라인: `filterStarterKitsByCategory` → `filterStarterKitsBySearch` (AND 조건, 기존
  #5/#6 유틸 그대로 재사용, 새 필터 로직 추가 없음).
- `selectedCategory` 또는 `searchQuery`가 바뀌면 `useEffect`에서 `visibleCount`를 `PAGE_SIZE`로
  리셋 + `window.scrollTo({ top: 0 })` + `statusMessage`를 결과 요약 문구로 갱신.
- `hasMore = visibleCount < filteredKits.length`. `useInfiniteScroll`에 `enabled: hasMore`로 전달.
- `handleIntersect`: `isLoadingMore=true` + 로딩 시작 아리아 문구 → `visibleCount`를
  `min(current + PAGE_SIZE, filteredKits.length)`로 증가 → 완료 아리아 문구(`"N개의 스타터 킷을
추가로 불러왔습니다"`) → `isLoadingMore=false`.
- 렌더 분기 3단계:
  1. `starterKits.length === 0` → `StarterKitEmptyState` (전역 빈 상태, 필터 이전 원본 기준)
  2. `filteredKits.length === 0` → `StarterKitFilteredEmptyState` + `aria-live` 영역
  3. 정상: 그리드(`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`) + 카드 + (`isLoadingMore`일 때
     `StarterKitCardSkeleton` 9슬롯) + (`hasMore`일 때만 `<div ref={sentinelRef} />`, `tabIndex` 없음)
- 카드 클릭 시 `router.push(\`/templates/${selected.id}\`)` (요약 모달 없이 즉시 이동).
- `aria-live="polite"` + `role="status"` + `className="sr-only"` 영역을 모든 렌더 분기(빈 상태
  포함)에서 재사용 — 새 aria-live 영역을 만들지 않는다.
- 에러 케이스: 없음(순수 파생 상태 컴포넌트, throw 없음). `starterKits`가 빈 배열이어도 정상 분기.

## 테스트 시나리오

### `useInfiniteScroll`

- [정상] useInfiniteScroll — should call onIntersect when sentinel intersects the viewport
- [정상] useInfiniteScroll — should stop observing (disconnect) when unmounted
- [경계] useInfiniteScroll — should not create an observer when enabled is false
- [경계] useInfiniteScroll — should not create an observer when sentinelRef.current is null
- [경계] useInfiniteScroll — should re-observe the new sentinel when enabled changes from false to true

### `StarterKitInfiniteList`

- [정상] StarterKitInfiniteList — should render only the first 9 items when more than 9 kits exist (AC: 목록 하단 스크롤 전)
- [정상] StarterKitInfiniteList — should reveal 9 more items and hide the sentinel/skeleton once all items are shown when the sentinel intersects with more than 9 items remaining (AC-06)
- [정상] StarterKitInfiniteList — should show skeleton cards while additional items are loading, then remove them once loaded
- [정상] StarterKitInfiniteList — should announce a loading-start message in the aria-live region when more items begin loading (AC-04)
- [정상] StarterKitInfiniteList — should announce a loading-complete message with the added count in the aria-live region once more items are loaded (AC-04)
- [정상] StarterKitInfiniteList — should navigate to `/templates/[id]` immediately when a card is selected (no summary modal)
- [경계] StarterKitInfiniteList — should render all items at once without a sentinel or skeleton UI when total items are 9 or fewer (AC-02)
- [경계] StarterKitInfiniteList — should render all items at once without a sentinel when total items are exactly 9
- [경계] StarterKitInfiniteList — should reset visibleCount to 9 and scroll to top when selectedCategory changes (AC-03)
- [경계] StarterKitInfiniteList — should reset visibleCount to 9 and scroll to top when searchQuery changes
- [경계] StarterKitInfiniteList — should remove the sentinel and loading indicator once the last item is revealed (no items left to load) (AC-07)
- [경계] StarterKitInfiniteList — should not move DOM focus when new cards are appended after loading completes (AC-05)
- [경계] StarterKitInfiniteList — should render the sentinel as a `<div>` without a `tabIndex` attribute, so keyboard Tab traversal skips it and lands on the next focusable card (AC-06 키보드 케이스)
- [예외] StarterKitInfiniteList — should render the global empty state (`StarterKitEmptyState`) when starterKits is an empty array
- [예외] StarterKitInfiniteList — should render the filtered empty state (`StarterKitFilteredEmptyState`) with an aria-live announcement when category/search filtering results in zero items

## AC 커버리지 대조

| AC  | 내용                                                         | 커버 시나리오                                                                                                          |
| --- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| 1   | 9개 초과 시 스크롤로 다음 9개 추가 로딩                      | "should reveal 9 more items ... when the sentinel intersects"                                                          |
| 2   | 9개 이하면 sentinel/로딩 UI 없이 즉시 전부 표시              | "should render all items at once without a sentinel or skeleton UI when total items are 9 or fewer" + "exactly 9" 경계 |
| 3   | 필터 변경 시 9개로 리셋 + 새 카테고리로 재나열               | "should reset visibleCount to 9 and scroll to top when selectedCategory changes"                                       |
| 4   | 로딩 중 aria-live로 시작/완료 안내                           | "should announce a loading-start message..." + "...loading-complete message..."                                        |
| 5   | 로딩 완료 후 포커스/스크롤 위치 임의 이동 없음               | "should not move DOM focus when new cards are appended after loading completes"                                        |
| 6   | Tab 순회 시 sentinel 자체는 포커스되지 않고 다음 카드로 이동 | "should render the sentinel as a `<div>` without a `tabIndex` attribute..."                                            |
| 7   | 더 로드할 항목 없으면 sentinel/로딩 인디케이터 제거          | "should remove the sentinel and loading indicator once the last item is revealed"                                      |

7/7 AC 모두 최소 1개 이상의 시나리오로 커버됨.

## 판단 근거 (자율 결정 기록)

- **기존 구현을 시그니처로 그대로 채택**: 이슈 본문의 작업 범위 항목이 `feature/templates` 브랜치의
  기존 커밋(`9806545`)과 문자 그대로 일치한다. 새 패턴을 발명하지 말라는 지시에 따라, 이미 구현된
  코드의 실제 타입/동작을 관찰해 시그니처로 고정했다(추측 기반 재설계 금지).
- **테스트 파일 부재 확인**: `src/features/starter-kit` 하위에 `*.test.*`가 3개뿐이고 두 대상
  파일 모두 테스트가 없음을 확인했다. 따라서 이 이슈의 실질 작업은 "기존 동작의 회귀 방지 테스트
  작성"이며, 시나리오는 새 기능 요구가 아니라 현재 구현이 이미 보장하는 동작을 근거로 도출했다.
- **AC-06 통합 처리**: 이슈 AC 목록 중 "다음 9개 로딩"과 "키보드로 sentinel 건너뛰기"가 이슈 본문
  체크박스에서는 별도 항목이지만 논리적으로 "sentinel 관련 두 측면"이라 시나리오 리스트에서는 별도
  테스트로 분리하되 표에서는 각각 매핑해 AC 7개 전부와 1:1 이상 대응되게 했다(가장 보수적 해석 —
  AC 문구를 줄이거나 합치지 않음).
- **skeleton 표시 시나리오는 AC에 직접 매핑되지 않지만 유지**: "로딩 인디케이터: 스켈레톤 카드
  9슬롯"은 작업 범위에 명시되어 있으나 AC 문구에는 스켈레톤을 직접 언급하는 항목이 없다. AC 밖의
  요구이므로 표의 AC 매핑에는 넣지 않았고, 시나리오 목록에서는 구현 스펙 보존을 위해 별도 항목으로
  남겼다(회귀 방지 목적, AC 커버리지 요건과는 무관).
