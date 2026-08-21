# Issue #6 — templates 카테고리 필터(단일 선택)

이슈: [feature: templates] 카테고리 필터(단일 선택)
관련 문서: [prd.md](./prd.md) "카테고리 필터 상태관리" / "카테고리 필터 UI의 접근성 시맨틱" ADR · [spec-fixed.md](./spec-fixed.md) AC-02, AC-05

## 선행 조사 결과 (중요)

이슈 본문이 요구하는 파일들은 **이미 커밋 `9806545`("templates 전체 목록 페이지 구현: 카테고리
필터·실시간 검색·무한스크롤")로 현재 브랜치 히스토리에 존재한다** (`git merge-base --is-ancestor
9806545 HEAD` 확인 완료). 즉 시그니처를 새로 발명하는 단계가 아니라, **기존 구현을 확정 시그니처로
문서화하고, 구현엔 있지만 테스트로 아직 고정되지 않은 동작을 시나리오로 잡아 TDD 사이클의 안전망을
만드는 단계**다.

- `src/features/starter-kit/model/filter-by-category.ts` — 존재, 유닛 테스트도 존재
  (`filter-by-category.test.ts`)
- `src/features/starter-kit/ui/starter-kit-category-filter.tsx` — 존재, **컴포넌트 유닛 테스트 없음**
- `src/app/templates/page.tsx` — 존재, `searchParams: Promise<{ category?: string; q?: string }>` 반영됨
- `src/features/starter-kit/ui/starter-kit-filtered-empty-state.tsx` — 존재
- `aria-live` 상태 영역 — `starter-kit-infinite-list.tsx` 내부에 `role="status" aria-live="polite"`로 존재
- E2E(`templates-list.e2e.ts`)는 카드 렌더링·포커스·언어만 검증하고 **카테고리 필터 동작은 커버하지
  않음**

따라서 이번 이슈의 실질 산출물은: (1) 기존 시그니처 확정 기록, (2) 비어 있는 커버리지(컴포넌트
유닛 테스트, aria-live 문구 형식, 대비 검증)를 메우는 시나리오다.

## 확정 시그니처

### `filter-by-category.ts` (`src/features/starter-kit/model/filter-by-category.ts`, 기존)

```ts
export type StarterKitCategoryFilter = StarterKitCategory | 'all';

export function toStarterKitCategoryFilter(value: string | null): StarterKitCategoryFilter;

export function filterStarterKitsByCategory(
  kits: StarterKit[],
  category: StarterKitCategoryFilter
): StarterKit[];
```

- `any` 없음. `value: string | null`은 `useSearchParams().get('category')`가 반환하는 타입과 정확히 일치.
- 허용되지 않는 문자열/`null`은 예외를 던지지 않고 `'all'`로 폴백(에러 케이스를 예외가 아닌 안전한
  기본값으로 흡수하는 기존 패턴 — `feature-catalog`의 `toFeatureCategoryFilter`와 동일 모양).

### `StarterKitCategoryFilter` 컴포넌트 (`src/features/starter-kit/ui/starter-kit-category-filter.tsx`, 기존)

```ts
interface StarterKitCategoryFilterProps {
  selectedCategory: StarterKitCategoryFilter;
}

export function StarterKitCategoryFilter({
  selectedCategory,
}: StarterKitCategoryFilterProps): JSX.Element;
```

- `'use client'`. `useRouter()` + `usePathname()` + `useSearchParams()`로 `?category=` 동기화.
- `router.push(query ? \`${pathname}?${query}\` : pathname, { scroll: false })`—`feature-category-filter.tsx`와
동일 패턴(단, `feature-category-filter`는 `params.delete('page')`도 하지만 templates는 무한스크롤이
노출 개수를 컴포넌트 로컬 상태로 리셋하므로 URL의 `page` 파라미터가 없다 — 대칭 불필요).
- 렌더링: `<div role="group" aria-label="카테고리 필터">` + 옵션마다
  `<Button type="button" aria-pressed={isSelected} variant={isSelected ? 'default' : 'outline'}>`.

### `StarterKitFilteredEmptyState` 컴포넌트 (기존)

```ts
export function StarterKitFilteredEmptyState(): JSX.Element;
```

- Props 없음. 전역 빈 상태(`StarterKitEmptyState`)와 문구만 다르다("조건에 맞는 스타터 킷이 없습니다").

### `TemplatesPage` (`src/app/templates/page.tsx`, 기존)

```ts
interface TemplatesPageProps {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export default async function TemplatesPage({
  searchParams,
}: TemplatesPageProps): Promise<JSX.Element>;
```

- SSR 시점에 `toStarterKitCategoryFilter(category ?? null)`로 초기 필터값을 확정해 `StarterKitInfiniteList`에
  전달 — 클라이언트 마운트 후 재필터링에 의한 깜빡임 없음(AC-02).

### `aria-live` 상태 안내 (`starter-kit-infinite-list.tsx`, 기존)

- `role="status" aria-live="polite"` 컨테이너의 문구 형식: `` `${categoryLabel} 카테고리${searchLabel}, 총 ${resultCount}개의 스타터 킷` ``
  (예: `"전체 카테고리, 총 12개의 스타터 킷"`, `"erp 카테고리, 총 3개의 스타터 킷"`)
- 이슈 AC 문구("{카테고리명} 카테고리, 총 N개")와 실제 구현 문구(끝에 "의 스타터 킷" 추가)는 의미상
  동일하다고 판단 — AC는 형식 예시이지 완전 리터럴 일치 요구가 아니므로, 시나리오는 실제 구현 문구를
  기준으로 부분 문자열 포함 검증으로 잡는다(가장 보수적 해석: 이미 있는 구현 문구를 바꾸지 않고, 그
  문구가 AC가 요구하는 정보(카테고리명 + 총 개수)를 포함하는지만 검증).

## AC 대조

| AC  | 내용                                                               | 커버 시나리오                                                                                                    |
| --- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| 1   | 칩 선택 → 해당 카테고리만 표시 + URL `?category=` 갱신             | S1, S2                                                                                                           |
| 2   | `?category=Frontend` 직접 접속 → 초기 렌더부터 필터링(깜빡임 없음) | S3                                                                                                               |
| 3   | 새로고침/뒤로가기 시 필터 유지                                     | S3 (SSR 초기값 반영이 곧 새로고침 유지의 근거 — page.tsx가 매 요청마다 URL을 읽으므로 별도 클라이언트 상태 없음) |
| 4   | 특정 카테고리에 결과 0개 → 필터 전용 빈 상태                       | S4                                                                                                               |
| 5   | 키보드 Tab+Enter/Space로 동일 동작                                 | S5                                                                                                               |
| 6   | aria-live로 "{카테고리명} 카테고리, 총 N개" 안내                   | S6                                                                                                               |
| 7   | 선택/비선택 칩 라이트·다크 대비 4.5:1 이상                         | S7                                                                                                               |

7/7 AC 커버.

## 테스트 시나리오

파일 대상: `src/features/starter-kit/model/filter-by-category.test.ts`(기존 확장),
`src/features/starter-kit/ui/starter-kit-category-filter.test.tsx`(신규),
`src/features/starter-kit/ui/starter-kit-filtered-empty-state.test.tsx`(신규, 선택적 — 이미 단순해
스킵 가능하나 렌더 스모크 1건은 저비용이므로 포함).

### 정상 케이스

- **S1. should call router.push with category query when a category chip is clicked** — `StarterKitCategoryFilter`에서
  `selectedCategory="all"`로 렌더 후 "erp" 칩 클릭 시 `router.push('/templates?category=erp', { scroll: false })` 호출.
- **S2. should call router.push without category query when "All" chip is clicked while another category is selected** —
  `selectedCategory="erp"`로 렌더 후 "All" 클릭 시 `router.push('/templates', { scroll: false })` 호출(쿼리
  파라미터 완전 제거, `feature-category-filter`와 동일하게 `category` key delete 확인).
- **S3. should mark the matching category chip as pressed via aria-pressed when selectedCategory prop is set** —
  `selectedCategory="포트폴리오"`로 렌더 시 "포트폴리오" 버튼만 `aria-pressed="true"`, 나머지는 `"false"`
  (SSR 초기값 반영 및 새로고침/뒤로가기 유지의 컴포넌트 단위 근거 — page.tsx가 서버에서 넘긴 값을
  그대로 신뢰한다는 계약을 검증).
- **S4. should render StarterKitFilteredEmptyState when filtered result is empty but total kits exist** —
  `starter-kit-infinite-list`(기존 파일, 신규 테스트 추가 없이 filter-by-category 레벨에서 이미
  간접 검증됨 — `filterStarterKitsByCategory`가 빈 배열을 반환하는 경우는 S_edge로 이관, 컴포넌트
  자체 신규 테스트는 범위 밖 유지) — _주: `starter-kit-infinite-list.tsx`는 이슈 #5 산출물이라 이번
  이슈에서 신규 테스트 파일을 만들지 않는다. 필터링 순수 함수(S_edge2)로 결과 0건 조건만 고정한다._
- **S5. should activate the chip on Enter key when it has keyboard focus** — `userEvent.tab()`으로 포커스
  이동 후 `userEvent.keyboard('{Enter}')` → 네이티브 `<button>` 시맨틱이므로 클릭과 동일한 `onClick`
  핸들러가 실행되어 `router.push` 호출 확인(별도 keydown 핸들러가 없다는 사실 자체가 시그니처
  결정 — 네이티브 button 동작에 위임).
- **S6. should render group role with accessible label "카테고리 필터"** — `getByRole('group', { name: '카테고리 필터' })`
  존재 확인.

### 경계 케이스

- **S_edge1. should return "all" when value is null (toStarterKitCategoryFilter)** — 기존 테스트로 이미 커버됨
  (`filter-by-category.test.ts` "null이면 all을 반환한다") — 신규 작성 불필요, 회귀 감시 대상으로만 명시.
- **S_edge2. should return empty array when no kit matches the selected category (filterStarterKitsByCategory)** —
  기존 테스트로 이미 커버됨("일치하는 킷이 없으면 빈 배열을 반환한다") — AC-04(빈 상태 트리거 조건)의
  순수 함수 레벨 근거로 재확인, 신규 작성 불필요.
- **S_edge3. should render solid variant("default") for selected chip and outline variant for unselected chips** —
  `selectedCategory="erp"`로 렌더 후 "erp" 버튼과 "All" 버튼의 클래스/variant 차이를 DOM에서 구분
  (색상+형태 이중 구분 요구의 회귀 방지 — variant prop이 실제로 다른 값으로 전달되는지).

### 예외/미검증 케이스

- **S7. 대비(contrast) 4.5:1 이상 — 코드 레벨 테스트로 검증 불가능한 영역**. shadcn `Button`의
  `default`/`outline` variant는 `src/components/ui/button.tsx`의 Tailwind 토큰(`bg-primary
text-primary-foreground` 등)에 의해 결정되며, 실제 렌더링된 RGB 대비값은 단위 테스트로 계산하지
  않는다(디자인 토큰 자체가 프로젝트 전역 대비 기준을 만족하도록 별도 관리되는 영역 — `docs/design/accessibility.md`
  참조). 이 AC는 **자동화 테스트가 아니라 수동/도구 기반 검증(Chrome DevTools 대비 체커, axe 등)으로
  Refactor 또는 security-review 단계에서 실측 기록**하는 것으로 대체한다. TDD Red/Green 단계의 테스트
  코드 대상에서 제외한다.

## 판단 근거 요약

- **기존 패턴 우선**: `feature-category-filter.tsx`(더 최근 커밋, 같은 URL 쿼리스트링 패턴)와
  `starter-kit-category-filter.tsx`(같은 feature 폴더 내부, 실제 대상 파일)가 이미 동일 모양이라
  충돌 없음 — 새 패턴 발명 없이 기존 구현을 그대로 시그니처로 확정.
- **좁은 해석 선택**: aria-live 문구는 AC 예시 문구와 다르지만("총 N개" vs "총 N개의 스타터 킷"), 이미
  구현된 문구를 변경 대상으로 삼지 않고 "정보 포함 여부"만 검증하는 쪽을 택했다 — 문구를 AC 리터럴에
  맞춰 바꾸는 것은 요청받지 않은 변경이며, 정보 충실도 기준으로는 이미 AC를 만족한다.
- **범위 밖 처리**: `starter-kit-infinite-list.tsx`는 이슈 #5(목록·무한스크롤) 산출물이므로 이번
  이슈에서 신규 테스트 파일을 만들지 않는다. 카테고리 필터가 그 컨테이너와 상호작용하는 지점(빈 상태
  분기, 노출 개수 리셋)은 순수 함수 테스트로 이미 고정되어 있으므로 충분하다고 판단.
- **대비(AC-07)는 코드 테스트 대상에서 제외**: 값 계산이 아닌 렌더링된 픽셀 대비 측정은 Vitest 단위
  테스트의 책임 범위를 벗어난다(YAGNI — 자동화 인프라 신설은 이 이슈 스코프 밖). 수동 검증으로 대체.

## 보강 — ac-verifier 갭 메우기 (AC-2, 3, 4, 5, 6)

이슈 #11로 AC-07(대비)이 분리된 뒤, ac-verifier가 AC-2/3/4/5/6을 "부분충족"으로 판정했다.
공통 원인은 `starter-kit-infinite-list.tsx`(카테고리 필터가 실제로 목록에 반영되는 통합
지점, 빈 상태 분기, aria-live 문구가 모두 위치)에 대한 컴포넌트 유닛 테스트가 전무했다는
점이다. 위 "판단 근거 요약"의 "범위 밖 처리" 항목(`starter-kit-infinite-list.tsx`에 신규
테스트 파일을 만들지 않는다는 판단)은 AC-4/6을 실질적으로 검증 불가능하게 만들어 **이번
보강에서 뒤집는다** — 신규 컴포넌트 테스트 파일을 작성한다.

### 확인한 실제 구조 (근거)

`src/features/starter-kit/ui/starter-kit-infinite-list.tsx`:

- Props: `{ starterKits: StarterKit[]; selectedCategory: StarterKitCategoryFilter; searchQuery: string }`.
- 필터링 반영: `filterStarterKitsByCategory(starterKits, selectedCategory)` →
  `filterStarterKitsBySearch(categoryFilteredKits, searchQuery)` 순서로 합성해 `filteredKits`를 만들고,
  이 값을 그대로 카드 목록·빈 상태 분기·aria-live 문구 계산에 사용한다(39~40번 줄).
- 빈 상태 분기(AC-4): `starterKits.length === 0`이면 `StarterKitEmptyState`(전역 빈 상태),
  `filteredKits.length === 0`이면(원본은 있으나 필터 결과만 0건) `StarterKitFilteredEmptyState`를
  렌더링한다(79~88번 줄). 즉 AC-4를 검증하려면 `starterKits`는 비어 있지 않되 `selectedCategory`로
  전량이 걸러지는 조합으로 렌더해야 한다.
- aria-live 문구(AC-6): `role="status" aria-live="polite"` 컨테이너의 `statusMessage` 값은
  `` `${categoryLabel} 카테고리${searchLabel}, 총 ${resultCount}개의 스타터 킷` `` 형식이며(54번 줄),
  `categoryLabel`은 `selectedCategory === 'all' ? '전체' : selectedCategory`(예: `'erp'`, `'포트폴리오'`).
  이 문구는 `useEffect` 안에서 `selectedCategory`/`searchQuery`/`starterKits`가 바뀔 때마다 갱신되므로,
  컴포넌트 테스트에서는 `act`가 필요 없는 RTL의 비동기 대기(`findBy`/`waitFor`)로 읽어야 한다(마운트 시
  useEffect가 비동기 스케줄로 실행되는 React 특성).
- 빈 상태 분기(79~88번 줄)에서도 동일한 `role="status" aria-live="polite"` 컨테이너를 렌더링한다 —
  AC-4와 AC-6 시나리오를 한 렌더에서 같이 검증할 수 있다.
- `useRouter`(next/navigation)를 사용하므로 기존 `starter-kit-category-filter.test.tsx`와 동일하게
  `vi.mock('next/navigation', ...)`으로 `useRouter`를 모킹해야 렌더가 에러 없이 통과한다.
- `useInfiniteScroll` 훅(`../lib/use-infinite-scroll`)이 `IntersectionObserver`를 사용하므로, jsdom
  환경에서 `IntersectionObserver`가 정의되지 않은 경우 최소 스텁이 필요할 수 있다 — 기존 프로젝트에
  전역 스텁이 있는지 먼저 `vitest.setup`류 파일을 확인하고, 없으면 테스트 파일 상단에서
  `vi.stubGlobal('IntersectionObserver', ...)`로 최소 모킹한다(신규 패턴 발명이 아니라 테스트 실행을
  위한 필수 스텁이므로 범위 내).

### 신규 테스트 파일: `src/features/starter-kit/ui/starter-kit-infinite-list.test.tsx`

`@vitest-environment jsdom`, `starter-kit-category-filter.test.tsx`와 동일하게 `next/navigation`
모킹 + `cleanup`/`afterEach` 패턴을 따른다. `createMockStarterKit`(`../model/test-fixtures.ts`)으로
카테고리가 다른 목 데이터 여러 개를 구성한다.

#### 정상 케이스

- **S8. should render only kits matching selectedCategory when a category filter is applied** —
  `category: 'erp'`인 킷 2개 + `category: '포트폴리오'`인 킷 1개를 `starterKits`로 넘기고
  `selectedCategory="erp"`로 렌더 → 화면에 erp 킷 2개의 제목만 보이고 포트폴리오 킷 제목은
  없음을 확인(AC-2/3의 컴포넌트 레벨 근거 — SSR에서 넘어온 `selectedCategory`가 초기 렌더부터
  즉시 필터링에 반영됨을 검증. 별도 클라이언트 상태 지연이 없으므로 깜빡임 없음의 근거가 됨).
- **S9. should render StarterKitFilteredEmptyState when starterKits exist but none match selectedCategory** —
  `category: '포트폴리오'`인 킷 1개만 있는 `starterKits`를 `selectedCategory="erp"`로 렌더 →
  `StarterKitFilteredEmptyState`가 렌더하는 문구("조건에 맞는 스타터 킷이 없습니다" 등, 실제 컴포넌트
  구현 텍스트 기준)가 화면에 보이고, 카드가 하나도 없음을 확인(AC-4 통합 지점 검증).
- **S10. should announce category name and result count via aria-live region** —
  `category: 'erp'`인 킷 2개를 포함한 `starterKits`를 `selectedCategory="erp"`로 렌더 →
  `screen.findByRole('status')`(또는 `waitFor`)로 `role="status"` 컨테이너 텍스트가 `'erp'`와
  `'2개'`를 모두 포함하는지 확인(리터럴 완전 일치가 아니라 정보 포함 여부로 검증 — 기존 문서의
  "좁은 해석 선택" 판단과 동일 기준 적용).
- **S11. should announce "전체" as category label when selectedCategory is "all"** —
  `selectedCategory="all"`로 렌더 → aria-live 문구에 `'전체'`가 포함됨을 확인(categoryLabel 분기
  회귀 방지).

#### 예외/미검증 케이스

- 무한스크롤(`useInfiniteScroll`)·스켈레톤 로딩 UI는 이번 보강 범위 밖(카테고리 필터와 무관한
  이슈 #5 동작) — 신규 테스트 대상에서 제외한다.

### `starter-kit-category-filter.test.tsx`에 추가할 케이스 (AC-5, Space 키)

기존 "키보드 포커스 후 Enter를 누르면 router.push가 호출된다"(54~63번 줄) 바로 아래에 대칭
케이스를 추가한다.

- **S12. should activate the chip on Space key when it has keyboard focus** —
  `selectedCategory="all"`로 렌더 → `user.tab()` 2회로 "erp" 칩까지 포커스 이동 →
  `user.keyboard('{ }')`(스페이스) → `pushMock`이 `'/templates?category=erp'`, `{ scroll: false }`로
  호출됐는지 확인. 기존 Enter 테스트와 동일하게 네이티브 `<button>` 시맨틱에 위임하는 동작이므로
  별도 keydown 핸들러 없이 통과해야 한다(회귀 시 네이티브 button 동작이 깨졌다는 신호).

### E2E 시나리오 추가 (`src/app/templates/templates-list.e2e.ts`, AC-2, AC-3)

기존 파일의 `test.describe('/templates — 목록 페이지', ...)` 블록 패턴(각 `test.beforeEach`에서
`page.goto` + `waitForLoadState('networkidle')`, `button[type="button"]` 셀렉터로 카드 확인)을
그대로 따르되, 카테고리 필터 시나리오는 `beforeEach`가 이미 `/templates`(쿼리 없음)로 이동하므로
별도 `describe` 블록으로 분리해 각 테스트에서 직접 `page.goto('/templates?category=...')`를 호출한다.
(기존 `describe` 블록의 공용 `beforeEach`를 재사용하면 쿼리 없는 상태로 한 번 이동한 뒤 다시
쿼리를 붙여 이동해야 해서 "초기 렌더부터"라는 AC-2 취지와 어긋나기 때문 — 새 `describe`는 기존
파일 구조를 벗어나는 새 패턴이 아니라 Playwright의 표준 `test.describe` 중첩일 뿐이다.)

- **S13 (E2E). `?category=` 쿼리로 직접 접속하면 초기 렌더부터 해당 카테고리 카드만 보인다** —
  `page.goto('/templates?category=erp')` → `waitForLoadState('networkidle')` → 카드 개수가
  0보다 크고(erp 카테고리에 시드 데이터가 있다는 전제), 페이지 텍스트에 다른 카테고리 전용 킷
  제목이 없음을 확인하거나, 더 안정적으로는 `StarterKitCategoryFilter`의 "erp" 버튼이
  `aria-pressed="true"`인지로 확인한다(`page.getByRole('button', { name: 'erp' })`의
  `aria-pressed` 속성 — 컴포넌트 유닛 테스트 S3와 동일 신호를 브라우저 레벨에서 재확인).
- **S14 (E2E). 새로고침 후에도 필터가 유지된다** — `page.goto('/templates?category=erp')` →
  `page.reload()` → `waitForLoadState('networkidle')` → "erp" 버튼이 여전히
  `aria-pressed="true"`인지 확인(SSR이 매 요청마다 URL을 읽으므로 클라이언트 상태 없이도
  유지된다는 계약의 브라우저 레벨 근거).
- **S15 (E2E). 뒤로가기 후 이전 필터로 돌아간다** — `page.goto('/templates')`(전체) →
  `page.getByRole('button', { name: 'erp' }).click()`으로 필터 적용(URL이
  `/templates?category=erp`로 바뀔 때까지 `page.waitForURL(/category=erp/)`) →
  `page.goBack()` → `page.waitForURL('**/templates')`(쿼리 없는 상태로 복귀) → "All" 버튼이
  `aria-pressed="true"`로 돌아왔는지 확인(브라우저 히스토리 엔트리가 URL 쿼리 변경 시점마다
  쌓인다는 전제 — `router.push`가 매번 새 히스토리 엔트리를 만드므로 `replace`가 아님을
  기존 컴포넌트 구현이 보장).

### 판단 근거 (보강)

- **범위 밖 처리 판단 뒤집기**: 기존 문서는 `starter-kit-infinite-list.tsx`를 이슈 #5 산출물로
  보고 신규 테스트 파일 작성을 보류했으나, ac-verifier가 이 판단이 AC-4/6을 검증 불가능하게
  만든다고 지적했다 — 순수 함수 테스트만으로는 "컴포넌트가 실제로 그 함수의 결과를 빈 상태
  컴포넌트 렌더링/aria-live 문구로 연결하는지"를 확인할 수 없기 때문이다. 이번 보강은 통합 지점
  자체를 검증 대상으로 승격한다.
- **Space 키는 별도 핸들러 없이 네이티브 button 시맨틱에 위임**: Enter 테스트와 동일 근거 — 새
  키보드 이벤트 핸들러를 추가하는 것이 아니라 이미 있는 `<Button type="button">` 시맨틱이
  Space도 처리한다는 사실을 테스트로 고정한다.
- **E2E `describe` 분리는 새 패턴이 아님**: 기존 파일의 selector 관례(`button[type="button"]`,
  `page.getByRole`)와 `waitForLoadState('networkidle')` 관례를 그대로 유지하되, Playwright
  표준 API(`page.goto` with query string, `page.reload()`, `page.goBack()`, `page.waitForURL()`)만
  추가로 사용한다 — 프로젝트 고유 패턴을 새로 발명하지 않는다.
- **좁은 해석 유지**: aria-live 문구 검증은 리터럴 완전 일치가 아니라 "카테고리명 + 총 개수"
  정보 포함 여부로 검증한다(기존 "판단 근거 요약"과 동일 기준).
