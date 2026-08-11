# Features 메뉴 목록 페이지 — 이슈 분해

**상위 문서**: [prd.md](./prd.md)

---

## 이슈 1: Feature 정적 데이터 + 카드 목록 페이지 (필터/페이지네이션 없이 전체 렌더링)

`feature-catalog` 도메인 슬라이스를 신설하고, 정적 Feature 데이터와 카드 UI로
`/features` 진입 시 전체 목록이 보이는 최소 페이지를 만든다.

**포함 작업(체크리스트, 이슈 분할 기준 아님)**

- `feature-catalog/model/types.ts` — `Feature` 타입, `FEATURE_CATEGORIES` 상수
- `feature-catalog/model/data.ts` — 정적 Feature 배열 (routing.md 예시 기반: search/board/comment/payment/notification 각 1개 이상)
- `feature-catalog/ui/feature-card.tsx` — id/title/description/category 표시, 클릭 동작 없음
- `src/app/features/page.tsx` — 서버 컴포넌트, 정적 데이터 전체를 카드 목록으로 렌더링

**의존성**: 없음 (최초 이슈)

## Acceptance Criteria

- [ ] Given `/features`에 처음 진입했을 때, When 페이지가 로드되면, Then 정적으로 정의된 모든 Feature 카드가 이름·설명·카테고리와 함께 화면에 보인다.
- [ ] Given Feature 카드가 화면에 보일 때, When 카드를 클릭하면, Then 아무 페이지 이동도 발생하지 않는다.

---

## 이슈 2: 카테고리 필터

카테고리 칩을 클릭하면 해당 카테고리의 Feature만 보이도록 필터링한다(`StarterKitCategoryFilter` 패턴 참고, URL `?category=` 반영).

**포함 작업**

- `feature-catalog/model/filter-by-category.ts` — 순수 함수 + 유닛 테스트
- `feature-catalog/ui/feature-category-filter.tsx` — URL 쿼리스트링 갱신
- `page.tsx`에서 `searchParams.category` 읽어 필터링 결과 렌더링

**의존성**: 이슈 1 (카드 목록, 데이터 타입)

## Acceptance Criteria

- [ ] Given `/features`에서 특정 카테고리(예: board)를 선택했을 때, When 필터가 적용되면, Then 해당 카테고리의 Feature 카드만 화면에 보인다.
- [ ] Given 카테고리 필터가 적용된 상태에서, When 페이지를 새로고침하면, Then 동일한 필터 결과가 유지된다(URL에 `?category=` 반영 확인).
- [ ] Given 카테고리 필터가 적용된 상태에서, When "All"을 선택하면, Then 전체 Feature 카드가 다시 보인다.

---

## 이슈 3: 검색 필터

검색어를 입력하면 이름/설명에 검색어가 포함된 Feature만 보이도록 필터링한다(`StarterKitSearchInput` 패턴 참고, URL `?q=` 반영, 카테고리 필터와 AND 조건).

**포함 작업**

- `feature-catalog/model/filter-by-search.ts` — 순수 함수 + 유닛 테스트
- `feature-catalog/ui/feature-search-input.tsx` — URL 쿼리스트링 갱신
- `page.tsx`에서 `searchParams.q`까지 함께 필터링

**의존성**: 이슈 2 (필터 조합 로직이 이미 자리 잡혀 있어야 AND 조건 추가가 자연스러움)

## Acceptance Criteria

- [ ] Given `/features`에서 검색어를 입력했을 때, When 이름 또는 설명에 검색어가 포함된 Feature가 있으면, Then 해당 Feature 카드만 화면에 보인다.
- [ ] Given 검색어와 카테고리 필터를 동시에 적용했을 때, When 두 조건을 모두 만족하는 Feature가 없으면, Then 빈 상태(empty state) UI가 보인다.
- [ ] Given 검색/필터 결과가 0개인 빈 상태 화면에서, When 검색어를 지우거나 필터를 초기화하면, Then 다시 조건에 맞는 카드들이 보인다.

---

## 이슈 4: 페이지네이션

필터링된 결과를 페이지당 6개씩 나눠 보여주고, 페이지네이션 컨트롤로 이동한다(URL `?page=` 반영, 필터 변경 시 1페이지로 초기화).

**포함 작업**

- `feature-catalog/model/paginate.ts` — 순수 함수 + 유닛 테스트
- `feature-catalog/ui/feature-pagination.tsx` — 이전/다음/페이지 번호 컨트롤, URL 쿼리스트링 갱신
- `page.tsx`에서 `searchParams.page` 반영, 카테고리/검색 변경 시 page 파라미터 제거(1페이지로 리셋)

**의존성**: 이슈 3 (필터링된 최종 목록이 있어야 페이지네이션 대상이 정해짐)

## Acceptance Criteria

- [ ] Given Feature가 6개보다 많을 때, When `/features`에 처음 진입하면, Then 1페이지(최대 6개)만 보이고 페이지네이션 컨트롤이 함께 보인다.
- [ ] Given 1페이지가 보이는 상태에서, When 다음 페이지 번호를 클릭하면, Then 다음 6개 Feature 카드로 바뀌고 URL에 `?page=2`가 반영된다.
- [ ] Given 특정 페이지(예: 2페이지)에 있는 상태에서, When 카테고리 또는 검색 필터를 변경하면, Then 1페이지로 돌아가 새 필터 기준 결과가 보인다.

---

## 승인 체크리스트

- [ ] 각 이슈가 완료 시 사용자에게 보여줄 수 있는 동작을 갖는다 (수직 슬라이스)
- [ ] AC가 관찰 가능한 결과로 끝난다 (구현 세부사항 노출 없음)
- [ ] 의존성 순서가 역방향 개발을 요구하지 않는다
