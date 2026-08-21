# Issue #24 — features 목록을 DB 기반으로 전환 + bookmark 교차 수정

GitHub: https://github.com/psy0821-k/frontend-starter-kit/issues/24

## 시그니처

### 1. `Feature` 타입 확장 — `src/features/feature-catalog/model/types.ts`

인터페이스 자체는 변경 없음, `FEATURE_CATEGORIES` 값 도메인만 8개로 확장.

```typescript
export interface Feature {
  id: string; // uuid
  title: string;
  description: string;
  category: FeatureCategory;
}

export const FEATURE_CATEGORIES = [
  'search',
  'board',
  'comment',
  'payment',
  'notification',
  'form',
  'ui',
  'performance',
] as const;

export type FeatureCategory = (typeof FEATURE_CATEGORIES)[number];
```

### 2. `getFeatures()` — 신규 `src/features/feature-catalog/api/get-features.ts`

```typescript
export async function getFeatures(): Promise<Feature[]>;
```

- `get-starter-kits.ts`와 동일한 시그니처 스타일이지만 **mock 폴백 없음**(PRD 기술 결정 1).
- `isSupabaseConfigured() === false` → `[]` 반환.
- 조회 에러(`error !== null`) → `console.error` 후 `[]` 반환.
- 정상 조회 시 `features` 테이블에서 `id, title, description, category`만 select(카드가
  쓰지 않는 `summary/tags/tech_stack/usage`는 제외), `updated_at` 기준 정렬.
- 에러를 throw하지 않는다 — 항상 배열 반환.

### 3. `FeatureEmptyState` — 신규 `src/features/feature-catalog/ui/feature-empty-state.tsx`

```typescript
export function FeatureEmptyState(): JSX.Element;
```

- `StarterKitEmptyState`와 동일 패턴(props 없음), 문구는 "등록된 Feature가 없습니다".

### 4. `FeaturesPage` — `src/app/features/page.tsx` 수정

- 정적 `FEATURES` import 제거 → `const allFeatures = await getFeatures()`.
- 분기 로직 추가: `allFeatures.length === 0` → `FeatureEmptyState`, 그 외에는 기존처럼
  필터링 후 `items.length === 0` → `FeatureFilteredEmptyState`(기존 로직 유지).

### 5. `assertTargetExists` 수정 — `src/app/api/bookmarks/route.ts`

feature 분기를 정적 배열 조회에서 DB 조회로 바꾸되, **에러 코드/메시지는 기존과 동일하게
유지**한다(400 VALIDATION_ERROR — 기존 `route.test.ts`가 이미 이 계약을 전제하고 있고,
PRD가 "시그니처/동작은 동일 유지"를 명시했으므로 template과의 에러 코드 통일은 이번
이슈 범위 밖으로 둔다).

```typescript
async function assertTargetExists(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  target: BookmarkTarget
): Promise<void> {
  if (target.targetType === 'feature') {
    const { data } = await supabase
      .from('features')
      .select('id')
      .eq('id', target.targetId)
      .maybeSingle<{ id: string }>();

    if (data === null) {
      throw new ApiError(400, 'VALIDATION_ERROR', '존재하지 않는 feature입니다');
    }
    return;
  }

  // template 분기는 변경 없음
}
```

### 6. 삭제

- `src/features/feature-catalog/model/data.ts`
- `src/features/feature-catalog/model/test-fixtures.ts`는 `data.ts`와 무관한 별도 팩토리이므로
  변경하지 않는다(그대로 유지).

## 설명

원격에 이미 존재하는 `features`/`feature_files` 테이블을 실제 데이터 소스로 삼아 `/features`
목록 페이지를 DB 기반으로 전환한다. 선행 작업으로 로컬에 누락되어 있던 마이그레이션
010~013을 DB 스키마에서 역산 복원해 커밋한다(멱등, 재실행해도 원격에 변경 없음). 정적
`FEATURES` 배열(`data.ts`)을 삭제하므로, 이를 참조하던 bookmark의 `assertTargetExists`도
같은 이슈에서 DB 조회로 함께 수정한다.

이 이슈가 완료되면 사용자가 `/features`에서 실제 DB 데이터(현재 15건)를 보고, Supabase
연결이 끊기거나 데이터가 없을 때도 일관된 빈 상태를 보며, bookmark 기능도 실제 feature id
(uuid)로 정상 동작한다.

## 변경 지점

- `supabase/migrations/010_features_schema.sql` ~ `013_features_add_usage.sql` — 신규 커밋
  (이미 원격에 적용되어 있던 내용을 역산 복원, 멱등)
- `src/features/feature-catalog/model/types.ts` — `Feature.id`를 uuid 기준으로,
  `FEATURE_CATEGORIES`를 8개(search/board/comment/payment/notification/form/ui/performance)로 확장
- `src/features/feature-catalog/api/get-features.ts` — 신규. `get-starter-kits.ts`와 동일한
  시그니처 스타일(`Promise<Feature[]>`), 미설정/에러/실제 0건 모두 `[]` 반환
- `src/app/features/page.tsx` — 정적 `FEATURES` import 제거, `await getFeatures()` 호출로 변경
- `src/features/feature-catalog/ui/feature-empty-state.tsx` — 신규. `StarterKitEmptyState`와
  동일 패턴, "등록된 Feature가 없습니다" 안내
- `src/features/feature-catalog/model/data.ts` — 삭제
- `src/features/feature-catalog/model/test-fixtures.ts` — 기존 테스트가 참조 중이면 유지(단,
  `data.ts` 삭제와 무관한 별도 팩토리이므로 원칙적으로 변경 불필요, 삭제 후 회귀 테스트로 확인)
- `src/app/api/bookmarks/route.ts`의 `assertTargetExists` — `FEATURES.some(...)` 대신
  `features` 테이블을 `select('id').eq('id', targetId).maybeSingle()`로 직접 조회하도록 수정
  (`templates` 존재 검증과 동일한 패턴)

## Acceptance Criteria

- [ ] Given 로컬 저장소를 새로 clone한 뒤 마이그레이션(010~013 포함)을 순서대로 재생했을 때, When 결과 스키마를 확인하면, Then 현재 원격 DB의 `features`/`feature_files` 테이블 구조(컬럼, RLS, 함수)와 동일하다.
- [ ] Given Supabase가 정상 연결된 상태에서, When 사용자가 `/features`에 접속하면, Then 실제 DB에 등록된 Feature 카드가 표시된다(더 이상 정적 배열이 아님).
- [ ] Given Supabase 환경변수가 설정되지 않은 상태에서, When 사용자가 `/features`에 접속하면, Then "등록된 Feature가 없습니다" 빈 상태 UI가 표시된다(mock 데이터가 아님).
- [ ] Given Supabase 조회가 에러를 반환하는 상황에서, When 사용자가 `/features`에 접속하면, Then 위와 동일한 "등록된 Feature가 없습니다" 빈 상태 UI가 표시된다.
- [ ] Given DB에 등록된 Feature가 실제로 0건인 상황에서, When 사용자가 `/features`에 접속하면, Then 위와 동일한 빈 상태 UI가 표시된다.
- [ ] Given 검색어/카테고리 필터를 적용했으나 결과가 0건인 상황에서, When 화면을 보면, Then (전체 데이터는 있으므로) 기존 `FeatureFilteredEmptyState`("조건에 맞는 Feature가 없습니다")가 표시되어 위의 전체 빈 상태와 구분된다.
- [ ] Given 카테고리 필터 UI를 열었을 때, When 옵션 목록을 보면, Then 8개 카테고리(search/board/comment/payment/notification/form/ui/performance) 모두 선택 가능하다.
- [ ] Given 로그인한 사용자가 실제 DB에 존재하는 feature(uuid)를 북마크 버튼으로 클릭했을 때, When 요청이 처리되면, Then `VALIDATION_ERROR` 없이 정상적으로 북마크된다.

## 의존성

없음(bookmark 이슈 #21~#23과는 코드 경합이 있으나 기능적으로 독립 — `assertTargetExists`의
내부 구현만 바뀌고 시그니처/동작은 동일하게 유지).

## 테스트 시나리오

에러 처리 원칙(PRD 기술 결정 1): 사용자에게는 미설정/에러/실제 0건 세 경우 모두 동일한 빈
상태만 노출한다. 개발자용으로는 `getFeatures()` 내부에서 조회 에러 발생 시 `console.error`로
서버 로그에만 남기고, 반환값은 여전히 `[]`다(`get-starter-kits.ts`가 에러를 삼키고 mock으로
대체하는 것과 유사하되, 여긴 mock 대신 빈 배열로 대체).

### `getFeatures`

- [정상] Supabase가 정상 연결되고 데이터가 있을 때 — Feature 배열을 반환해야 한다
- [정상] 조회 성공 시 — id/title/description/category 필드만 선택해야 한다 (summary/tags 등은 포함하지 않는지 검증)
- [경계] Supabase가 설정되지 않았을 때 — 빈 배열을 반환해야 한다
- [경계] 실제로 등록된 Feature가 0건일 때 — 빈 배열을 반환해야 한다
- [예외] Supabase 조회가 에러를 반환할 때 — 예외를 던지지 않고 빈 배열을 반환해야 한다

### `FeatureEmptyState`

- [정상] 컴포넌트가 렌더링될 때 — "등록된 Feature가 없습니다" 문구를 표시해야 한다

### `FeaturesPage`

- [정상] getFeatures가 데이터를 반환할 때 — Feature 카드 목록을 렌더링해야 한다
- [경계] getFeatures가 빈 배열을 반환할 때(전체 0건) — FeatureEmptyState를 렌더링해야 한다
- [경계] 전체 데이터는 있으나 필터링 결과가 0건일 때 — FeatureFilteredEmptyState를 렌더링해야 한다
- [정상] FeatureCategoryFilter가 렌더링될 때 — 8개 카테고리 옵션을 표시해야 한다

### `assertTargetExists` (bookmark route, feature 분기)

- [정상] targetType이 feature이고 DB에 존재하는 uuid일 때 — 검증을 통과해야 한다
- [예외] targetType이 feature이고 DB에 존재하지 않는 uuid일 때 — 400 VALIDATION_ERROR를 던져야 한다

### AC 커버리지

| AC                               | 커버 시나리오                                                |
| -------------------------------- | ------------------------------------------------------------ |
| 1. 마이그레이션 재생 스키마 일치 | 자동화 테스트 범위 밖(수동/별도 절차로 검증)                 |
| 2. 정상 표시                     | `getFeatures` 정상 반환 + `FeaturesPage` 카드 렌더링         |
| 3. 미설정 빈 상태                | `getFeatures` 미설정 시 `[]` + `FeaturesPage` 빈 상태 렌더링 |
| 4. 에러 빈 상태                  | `getFeatures` 에러 시 `[]`                                   |
| 5. 실제 0건 빈 상태              | `getFeatures` 0건 시 `[]`                                    |
| 6. 필터 결과 0건 구분            | `FeaturesPage` FilteredEmptyState                            |
| 7. 카테고리 8개                  | `FeatureCategoryFilter` 8개 옵션                             |
| 8. bookmark 정상 동작            | `assertTargetExists` 정상/예외                               |

7개 AC(자동화 대상) 모두 최소 1개 이상의 시나리오로 커버됨을 확인했다.
