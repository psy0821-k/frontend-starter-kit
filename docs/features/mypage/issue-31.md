# Issue #31 — 내 북마크 목록 + 삭제

GitHub: https://github.com/psy0821-k/frontend-starter-kit/issues/31
PRD: [prd.md](./prd.md) · 확정 스펙: [spec-fixed.md](./spec-fixed.md) · 참고: [issue-2.md](./issue-2.md)

## 시그니처

### 북마크 목록 조회 — `src/features/mypage/api/get-my-bookmarks.ts`

```typescript
export interface MyBookmarkItem {
  targetType: 'template' | 'feature';
  targetId: string;
  title: string;
  createdAt: string; // bookmarks.created_at, ISO 문자열
}

/**
 * 로그인 사용자의 북마크를 target_type별로 templates/features와 join하여 조회한다.
 * 서버 컴포넌트(src/app/mypage/page.tsx) 전용 — get-bookmark-state-for-server.ts와 동일하게
 * Supabase를 직접 조회한다(클라이언트 fetch 방식이 아님).
 * - Supabase가 설정되지 않은 경우(isSupabaseConfigured() === false) 빈 배열을 반환한다.
 * - 원본(templates/features)이 삭제되어 join 결과가 없는 북마크는 배열에서 제외한다
 *   (조용히 필터링 — 에러를 던지지 않음).
 * - created_at 내림차순(최신 북마크 먼저)으로 정렬한다.
 */
export async function getMyBookmarks(userId: string): Promise<MyBookmarkItem[]>;
```

**구현 방식**: `bookmarks`를 `target_type`별로 두 그룹(`template`/`feature`)으로 나눠 각각
`templates`/`features` 테이블에서 `id in (targetIds)`로 조회한 뒤 메모리에서 join한다
(polymorphic association이라 SQL 레벨 join이 불가능 — `bookmarks` 테이블 설계 주석 참고).
원본이 없는 `targetId`는 결과에서 자연히 제외된다.

### 북마크 목록 UI — `src/features/mypage/ui/my-bookmark-list.tsx`

```typescript
export interface MyBookmarkListProps {
  items: MyBookmarkItem[];
}

export function MyBookmarkList(props: MyBookmarkListProps): JSX.Element;
```

- `items`가 빈 배열이면 빈 상태(empty state) 안내 문구를 표시한다(예: "아직 북마크한 항목이
  없습니다").
- 각 항목에 타입 배지(`components/ui/badge`, `template` → "템플릿" / `feature` → "기능")와
  `title`, 삭제 버튼을 표시한다. `feature-card.tsx`와 동일하게 `components/ui`를
  `features/*/ui`에서 직접 import한다(eslint `import/no-restricted-paths` 검증 완료 — 이
  경로는 허용됨).
- 삭제 버튼 클릭 시 기존 `removeBookmark`(`src/features/bookmark/api/bookmark-client.ts`)를
  `{ targetType, targetId }`로 호출한다 — 새 API를 만들지 않는다.
- 삭제 성공 시 목록에서 해당 항목을 즉시 제거한다(로컬 state 갱신, 별도 재조회 없음).
- 삭제 실패 시(`ApiError`) 해당 항목은 목록에 그대로 남고, 에러 토스트를 표시한다
  (`bookmark-button.tsx`의 `toast.error` 패턴 재사용).
- 삭제 진행 중인 항목은 버튼을 `disabled` 처리해 중복 클릭을 막는다(로딩 상태는 항목별로
  독립 관리 — 한 항목 삭제 중에도 다른 항목은 조작 가능해야 함).

### 마이페이지 연동 — `src/app/mypage/page.tsx` (수정)

```typescript
export default async function MyPage(): Promise<JSX.Element | null>;
```

- 기존 인증 가드(`getCurrentUser()` → null이면 `/auth/login` redirect)는 그대로 유지한다.
- 로그인 확인 후 `getMyBookmarks(user.id)`를 호출해 `MyBookmarkList`에 `items`로 전달한다.
- `NicknameForm` 아래에 "내 북마크" 섹션으로 이어붙인다(같은 페이지 내 두 번째 섹션, 별도
  라우트 아님).

## 설명

`/mypage`에 "내 북마크" 섹션을 추가한다. 이슈 1(#30)에서 만든 페이지 골격 위에 이어붙이는
형태다. 템플릿과 기능을 하나의 목록에 섞어서 타입 배지로 구분해 보여주고, 각 항목에서 바로
북마크를 해제(삭제)할 수 있다. 삭제는 새 API를 만들지 않고 기존 `/api/bookmarks` DELETE를
재사용한다(`removeBookmark`).

## 변경 지점

- `src/features/mypage/api/get-my-bookmarks.ts` — 신규
- `src/features/mypage/ui/my-bookmark-list.tsx` — 신규
- `src/app/mypage/page.tsx` — 수정 (`getMyBookmarks()` 결과를 `MyBookmarkList`에 전달)

## Acceptance Criteria 커버리지 (4/4)

| #   | AC                                                                    | 커버 시나리오 |
| --- | --------------------------------------------------------------------- | ------------- |
| 1   | 템플릿 2개 + 기능 1개 북마크 → 3개 항목이 타입 배지와 함께 표시       | S1, S6        |
| 2   | 항목 삭제 버튼 클릭 → 목록에서 사라지고 `bookmarks` 테이블에서도 삭제 | S2, S7        |
| 3   | 북마크한 템플릿이 이미 삭제됨 → 그 항목은 표시되지 않음(에러 없음)    | S3            |
| 4   | 북마크 없음 → 빈 상태 안내 문구 표시                                  | S4, S8        |

## 시나리오

### `getMyBookmarks` — 정상

- **S1** — should return items sorted by createdAt descending with type badge info when user has bookmarked 2 templates and 1 feature
  (반환된 배열 길이 3, 각 항목의 `targetType`/`title`/`createdAt` 필드 존재 확인)

### `getMyBookmarks` — 경계

- **S4** — should return an empty array when user has no bookmarks

### `getMyBookmarks` — 예외/특이 케이스

- **S3** — should silently exclude a bookmark whose target template has been deleted (join returns no matching template row)
- **S5** — should return an empty array when Supabase is not configured (isSupabaseConfigured() === false)

### `MyBookmarkList` — 정상

- **S6** — should render each item with its type badge label ("템플릿" for template, "기능" for feature) and title
- **S7** — should call removeBookmark with the item's targetType and targetId and remove the item from the list when its delete button is clicked

### `MyBookmarkList` — 경계

- **S8** — should render the empty state message when items is an empty array

### `MyBookmarkList` — 예외

- **S9** — should keep the item in the list and show an error toast when removeBookmark rejects with an ApiError
- **S10** — should disable only the clicked item's delete button while its removeBookmark call is pending, leaving other items' buttons enabled

### `MyPage` (page.tsx) — 통합 (기존 page.test.tsx 확장)

- **S11** — should pass getMyBookmarks result to MyBookmarkList as items when user is logged in
