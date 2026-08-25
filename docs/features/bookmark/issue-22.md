# Issue #22 — templates 목록 카드 북마크 버튼 + 초기 하이드레이션

GitHub: https://github.com/psy0821-k/frontend-starter-kit/issues/22
PRD: [prd.md](./prd.md) · 선행 이슈: [issue-21.md](./issue-21.md)

## 시그니처

### API (`src/features/bookmark/api/get-bookmarked-ids.ts`, 신규)

```typescript
export async function getBookmarkedIds(
  targetType: BookmarkTargetType,
  userId: string | null
): Promise<Set<string>>;
```

- `userId`가 `null`(비로그인)이면 조회 없이 즉시 빈 `Set` 반환.
- Supabase 미설정 시 빈 `Set` 반환(`get-bookmark-state-for-server.ts`와 동일 패턴).
- `bookmarks` 테이블에서 `user_id` + `target_type` 일치하는 `target_id`만 조회.

### `StarterKitCard` 수정 (`src/features/starter-kit/ui/starter-kit-card.tsx`)

```typescript
interface StarterKitCardProps {
  starterKit: StarterKit;
  onSelect: (starterKit: StarterKit) => void;
  isBookmarked: boolean;
}
```

- 카드 전체를 감싸던 `<button>`을 `<div role="button" tabIndex={0} onClick={...} onKeyDown={...}>`로
  전환한다(Enter/Space 시 `onSelect` 호출을 직접 구현) — `BookmarkButton`이 카드 안에
  들어가면 버튼 중첩(HTML 스펙 위반)이 되기 때문.
- `CardContent` 안에 `BookmarkButton`을 배치하고, 그 `onClick`에서 `e.stopPropagation()`으로
  카드 클릭(상세 이동)과 분리한다.
- `isAuthenticated`는 `BookmarkButton`에 그대로 전달(비로그인 시 로그인 페이지 이동은
  `BookmarkButton`이 자체 처리 — 기존 로직 재사용, 새로 만들지 않음).

### `StarterKitInfiniteList` 수정

```typescript
interface StarterKitInfiniteListProps {
  starterKits: StarterKit[];
  selectedCategory: StarterKitCategoryFilter;
  searchQuery: string;
  bookmarkedIds: Set<string>;
  isAuthenticated: boolean;
}
```

- `StarterKitCard`에 `isBookmarked={bookmarkedIds.has(kit.id)}` 전달.

### `src/app/templates/(list)/page.tsx` 수정

- `getCurrentUser()`와 `getBookmarkedIds('template', userId)`를 `Promise.all`로 병렬 조회 후
  `StarterKitInfiniteList`에 `bookmarkedIds`, `isAuthenticated`로 전달.

## Out of Scope

- 상세 페이지 이동 후 토글 상태 유지(AC 3) — 새 코드 불필요. 기존
  `getBookmarkStateForServer`(상세 페이지)가 이미 보장.
- `BookmarkButton`/`useBookmark`의 토글 동작 자체 — 이미 검증된 컴포넌트 재사용.

## 테스트 시나리오

### `getBookmarkedIds`

- [정상] 로그인 사용자가 특정 target_type의 북마크 2건을 가지고 있을 때 해당 target_id 2개를
  담은 Set을 반환해야 한다
- [경계] 로그인 사용자가 해당 target_type의 북마크가 없을 때 빈 Set을 반환해야 한다
- [예외] userId가 null(비로그인)일 때 조회를 시도하지 않고 빈 Set을 반환해야 한다
- [예외] Supabase가 설정되지 않았을 때 조회를 시도하지 않고 빈 Set을 반환해야 한다

### `StarterKitCard`

- [정상] isBookmarked가 true일 때 북마크 버튼이 북마크됨 상태로 렌더링되어야 한다
- [정상] 카드를 클릭하면 onSelect가 호출되어야 한다
- [정상] 카드에 포커스된 상태에서 Enter를 누르면 onSelect가 호출되어야 한다
- [정상] 카드에 포커스된 상태에서 Space를 누르면 onSelect가 호출되어야 한다
- [경계] 북마크 버튼을 클릭하면 onSelect가 호출되지 않아야 한다(이벤트 전파 차단)
- [경계] role="button"과 tabIndex={0}을 가진 요소로 렌더링되어야 한다(중첩 버튼 없음 확인)

### `StarterKitInfiniteList`

- [정상] bookmarkedIds에 포함된 카드는 isBookmarked=true로, 포함되지 않은 카드는
  isBookmarked=false로 전달되어야 한다(무한스크롤로 추가 로드되는 카드도 동일한
  bookmarkedIds prop을 공유하는 같은 목록에서 렌더링되므로, 이 시나리오 하나로
  "추가 로드된 카드도 올바른 초기 상태"까지 함께 검증됨 — visibleCount 증가 로직
  자체는 기존 무한스크롤 테스트가 이미 커버)

## AC 커버리지 대조

| AC (이슈 #22)                                   | 커버 시나리오                                                                            |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 북마크한 3개 카드만 채워진 상태로 초기 렌더링   | `getBookmarkedIds` 정상 시나리오 + `StarterKitInfiniteList` bookmarkedIds 전달 시나리오  |
| 북마크 버튼 클릭 시 카드 클릭(상세 이동) 미발생 | `StarterKitCard` "북마크 버튼 클릭 시 onSelect 미호출" 시나리오                          |
| 목록에서 토글 후 상세 페이지에서도 동일 상태    | Out of Scope 처리 — 기존 `getBookmarkStateForServer`가 이미 보장(회귀 여부는 E2E로 확인) |
| 무한스크롤로 추가된 카드도 올바른 초기 상태     | `StarterKitInfiniteList` "추가 로드된 카드" 시나리오                                     |

모든 AC가 최소 1개 시나리오(또는 기존 보장 사항 확인)로 커버됨.
