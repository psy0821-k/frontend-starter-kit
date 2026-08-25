# Issue #23 — features 카드 북마크 버튼 + 초기 하이드레이션

GitHub: https://github.com/psy0821-k/frontend-starter-kit/issues/23
PRD: [prd.md](./prd.md) · 선행 이슈: [issue-21.md](./issue-21.md) · 병행 이슈: [issue-22.md](./issue-22.md)

## 시그니처

이슈 #22(templates 목록 카드 북마크)와 동일한 패턴을 그대로 적용한다.

### `FeatureCard` 수정 (`src/features/feature-catalog/ui/feature-card.tsx`)

```typescript
interface FeatureCardProps {
  feature: Feature;
  onSelect: (feature: Feature) => void;
  isBookmarked: boolean;
  isAuthenticated?: boolean;
}
```

- 카드 전체를 감싸던 `<button>`을 `<div role="button" tabIndex={0} onClick={...} onKeyDown={...}>`로
  전환한다(#22와 동일 — `BookmarkButton`이 카드 안에 들어가면 버튼 중첩이 되기 때문).
  `FeatureCard`는 `feature-list.tsx`에서만 쓰이므로(다른 사용처 없음 확인됨) `isBookmarked`는
  `StarterKitCard`와 달리 optional로 두지 않고 필수로 유지한다.
- `CardContent` 안에 `BookmarkButton`을 배치하고, 그 `onClick`에서 `e.stopPropagation()`으로
  카드 클릭(상세 이동)과 분리한다.
- `target: { targetType: 'feature', targetId: feature.id }`.

### `FeatureList` 수정

```typescript
interface FeatureListProps {
  features: Feature[];
  bookmarkedIds: Set<string>;
  isAuthenticated: boolean;
}
```

- `FeatureCard`에 `isBookmarked={bookmarkedIds.has(feature.id)}` 전달.

### `src/app/features/page.tsx` 수정

- `getCurrentUser()`와 `getBookmarkedIds('feature', userId)`를 `Promise.all`로 병렬 조회 후
  `FeatureList`에 `bookmarkedIds`, `isAuthenticated`로 전달.
- 빈 상태(`allFeatures.length === 0`) 분기는 북마크 조회 이전에 반환되므로 그대로 유지한다.

## Out of Scope

- `BookmarkButton`/`useBookmark`의 토글 동작 자체 — 이미 #22에서 검증된 컴포넌트 재사용.
- `FeatureCard`의 다른 사용처 — `feature-list.tsx` 외 사용처 없음(확인됨), `StarterKitCard`
  처럼 optional 처리할 필요 없음.

## 테스트 시나리오

### `FeatureCard`

- [정상] isBookmarked가 true일 때 북마크 버튼이 북마크됨 상태로 렌더링되어야 한다
- [정상] 카드를 클릭하면 onSelect가 호출되어야 한다
- [정상] 카드에 포커스된 상태에서 Enter를 누르면 onSelect가 호출되어야 한다
- [정상] 카드에 포커스된 상태에서 Space를 누르면 onSelect가 호출되어야 한다
- [경계] 북마크 버튼을 클릭하면 onSelect가 호출되지 않아야 한다(이벤트 전파 차단)
- [경계] role="button"과 tabIndex={0}을 가진 요소로 렌더링되어야 한다(중첩 버튼 없음 확인)

### `FeatureList`

- [정상] bookmarkedIds에 포함된 카드는 isBookmarked=true로, 포함되지 않은 카드는
  isBookmarked=false로 전달되어야 한다

## AC 커버리지 대조

| AC (이슈 #23)                                     | 커버 시나리오                                                                                                             |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 북마크한 feature 카드가 채워진 상태로 초기 렌더링 | `FeatureCard` isBookmarked=true 시나리오 + `FeatureList` bookmarkedIds 전달 시나리오                                      |
| 북마크 버튼 클릭 시 즉시 토글                     | `BookmarkButton`/`useBookmark`의 기존 검증(이미 #22/#37에서 실제 토글 통합 테스트로 확인됨) — 신규 테스트 불필요          |
| 페이지네이션 후 새 페이지 카드도 올바른 초기 상태 | `FeatureList` bookmarkedIds 전달 시나리오(페이지네이션은 서버에서 이미 필터링된 items를 받는 구조라 같은 시나리오로 커버) |
| 비로그인 클릭 시 로그인 페이지 이동               | `BookmarkButton`의 기존 검증(재사용, 신규 테스트 불필요)                                                                  |

모든 AC가 최소 1개 시나리오(신규 또는 기존 재사용 근거)로 커버됨.
