# Issue #21 — 북마크 기반 구축 + templates 상세 페이지 버튼

GitHub: https://github.com/psy0821-k/frontend-starter-kit/issues/21
PRD: [prd.md](./prd.md) · 확정 스펙: [spec-fixed.md](./spec-fixed.md)

## 시그니처

### 도메인 타입 — `src/features/bookmark/model/types.ts`

```typescript
export const BOOKMARK_TARGET_TYPES = ['template', 'feature'] as const;
export type BookmarkTargetType = (typeof BOOKMARK_TARGET_TYPES)[number];

export interface BookmarkTarget {
  targetType: BookmarkTargetType;
  targetId: string;
}

/** GET /api/bookmarks 응답 데이터 */
export interface BookmarkState {
  isBookmarked: boolean;
  count: number;
}
```

### Route Handler — `src/app/api/bookmarks/route.ts`

```typescript
// GET  /api/bookmarks?targetType=template&targetId={uuid}  → ApiResponse<BookmarkState>
//   - 비로그인도 허용. isBookmarked는 항상 false, count는 공개 정보로 반환.
// POST /api/bookmarks   body: { targetType, targetId }      → ApiResponse<BookmarkState> (200)
//   - 비로그인이면 401 AUTH_REQUIRED.
//   - 이미 북마크된 상태에서 재요청(unique_violation, 23505)해도 에러가 아니라
//     현재 상태(BookmarkState)를 재조회해 200으로 반환한다(idempotent).
// DELETE /api/bookmarks?targetType=template&targetId={uuid} → ApiResponse<BookmarkState>
//   - 비로그인이면 401 AUTH_REQUIRED.
//   - 이미 북마크가 없는 상태에서 재요청(0 rows affected)해도 에러가 아니라
//     현재 상태를 재조회해 200으로 반환한다(idempotent).
export async function GET(request: Request): Promise<NextResponse>;
export async function POST(request: Request): Promise<NextResponse>;
export async function DELETE(request: Request): Promise<NextResponse>;
```

**에러 케이스**

| 조건                                                                             | 에러                                     |
| -------------------------------------------------------------------------------- | ---------------------------------------- |
| `targetType`이 `BOOKMARK_TARGET_TYPES`에 없음                                    | `ApiError(400, 'VALIDATION_ERROR', ...)` |
| POST/DELETE인데 비로그인                                                         | `ApiError(401, 'AUTH_REQUIRED', ...)`    |
| `targetType === 'feature'`인데 `targetId`가 정적 목록에 없음                     | `ApiError(400, 'VALIDATION_ERROR', ...)` |
| `targetType === 'template'`인데 `targetId`가 실제 `templates.id`로 존재하지 않음 | `ApiError(404, 'NOT_FOUND', ...)`        |
| DB unique_violation(23505) 이외의 삽입/삭제 실패                                 | `ApiError(502, 'UPSTREAM_ERROR', ...)`   |

### 클라이언트 API 함수 — `src/features/bookmark/api/bookmark-client.ts`

```typescript
export function getBookmarkState(target: BookmarkTarget): Promise<BookmarkState>;
export function addBookmark(target: BookmarkTarget): Promise<BookmarkState>;
export function removeBookmark(target: BookmarkTarget): Promise<BookmarkState>;
```

내부적으로 기존 `apiClient`(`shared/api/client.ts`)의 `get`/`post`/`delete`를 사용하고, 쿼리스트링
구성만 담당한다. 별도 fetch 래퍼를 새로 만들지 않는다.

### 훅 — `src/features/bookmark/model/use-bookmark.ts`

```typescript
interface UseBookmarkOptions {
  /** mutation 실패 시 호출. 토스트 표시는 이 콜백을 받은 쪽(UI 레이어)의 책임. */
  onError?: () => void;
}

interface UseBookmarkResult {
  isBookmarked: boolean;
  count: number;
  isPending: boolean;
  toggle: () => void;
}

export function useBookmark(
  target: BookmarkTarget,
  initialData?: BookmarkState,
  options?: UseBookmarkOptions
): UseBookmarkResult;
```

- `useQuery({ queryKey: ['bookmark', target.targetType, target.targetId], queryFn: ..., initialData })`
- `useMutation`으로 토글 처리: `onMutate`에서 `setQueryData`로 낙관적 반영(반대 상태 + count ±1),
  `onError`에서 이전 값으로 롤백하고 `options.onError`를 호출, `onSettled`에서 `invalidateQueries`.
- `isPending`이 `true`인 동안 `toggle()` 재호출은 무시한다(중복 in-flight mutation 방지).
- 토스트 표시 자체는 훅이 직접 하지 않는다 — `options.onError` 콜백을 통해 호출부(`BookmarkButton`)에
  위임한다. 비로그인 리다이렉트도 마찬가지로 훅이 아니라 `BookmarkButton`(UI 레이어)의 책임이다
  (관심사 분리, 훅은 "로그인되어 있다"는 전제 하의 토글 로직만 담당).

### UI 컴포넌트 — `src/features/bookmark/ui/bookmark-button.tsx`

```typescript
interface BookmarkButtonProps {
  target: BookmarkTarget;
  initialData?: BookmarkState;
  isAuthenticated: boolean;
  className?: string;
}

export function BookmarkButton(props: BookmarkButtonProps): JSX.Element;
```

- `isAuthenticated`는 서버 컴포넌트(`templates/[id]/page.tsx`)가 `getCurrentUser()` 결과를
  boolean으로 내려줌 — 클라이언트에서 별도로 세션을 재조회하지 않는다(기존 `checkIsAdmin` 패턴과
  동일한 서버→클라이언트 전달 방식).
- 클릭 핸들러: `isAuthenticated === false`면 `router.push('/auth/login')`, `true`면 `toggle()` 호출.
- 실패 시 토스트는 기존 `shared/ui`의 Toast(shadcn sonner) 재사용.

### Provider — `src/app/query-provider.tsx`

```typescript
'use client';
export function QueryProvider({ children }: { children: React.ReactNode }): JSX.Element;
```

내부에서 `useState(() => new QueryClient())`로 클라이언트 인스턴스를 한 번만 생성한다(Next.js
App Router 공식 패턴).

## 설명

`bookmarks` 테이블, `/api/bookmarks` Route Handler, TanStack Query Provider(프로젝트 첫 도입),
`useBookmark` 훅, `BookmarkButton` 컴포넌트를 모두 만들고, `templates/[id]` 상세 페이지에
적용한다. 이 이슈가 완료되면 로그인 사용자가 템플릿 상세 페이지에서 북마크를 토글하고 카운트를
확인할 수 있다(사용자에게 보이는 완결된 동작).

## 변경 지점

- `supabase/migrations/010_bookmarks.sql` — 신규. `bookmarks` 테이블(`user_id`, `target_type`,
  `target_id`, `unique(user_id, target_type, target_id)`), RLS(본인 행만 삽입/삭제, 카운트
  조회는 공개)
- `src/app/api/bookmarks/route.ts` — 신규. `GET`(북마크 여부+카운트 조회), `POST`(추가),
  `DELETE`(해제). `getCurrentUser()`로 인증, 비로그인 시 401
- `src/features/bookmark/model/types.ts` — 신규. `BookmarkTargetType`(`'template' | 'feature'`),
  `BookmarkState` 등
- `src/features/bookmark/api/bookmark-client.ts` — 신규. `/api/bookmarks` fetch 래퍼, `ApiError` 매핑
- `src/app/query-provider.tsx` — 신규. 클라이언트 컴포넌트, `QueryClientProvider` 래핑
- `src/app/layout.tsx` — `QueryProvider`로 children 감싸기
- `src/features/bookmark/model/use-bookmark.ts` — 신규. `useQuery`(조회) + `useMutation`(토글,
  `onMutate`/`onError`/`onSettled`로 낙관적 업데이트+롤백+재검증)
- `src/features/bookmark/ui/bookmark-button.tsx` — 신규. 아이콘+카운트, 비로그인 시
  `router.push('/auth/login')`, 실패 시 토스트
- `src/app/templates/[id]/page.tsx` — 헤더 영역에 `BookmarkButton` 배치

## Acceptance Criteria

- [ ] Given 로그인한 사용자가 아직 북마크하지 않은 템플릿 상세 페이지에 있을 때, When 북마크 버튼을 클릭하면, Then 버튼이 즉시 채워진 상태로 바뀌고 카운트가 1 증가한다.
- [ ] Given 이미 북마크한 템플릿 상세 페이지에 있을 때, When 북마크 버튼을 다시 클릭하면, Then 버튼이 즉시 비워진 상태로 바뀌고 카운트가 1 감소한다.
- [ ] Given 비로그인 사용자가 템플릿 상세 페이지에 있을 때, When 북마크 버튼을 클릭하면, Then `/auth/login` 페이지로 이동한다.
- [ ] Given 북마크 버튼을 클릭했으나 API 요청이 실패하는 상황일 때, When 실패 응답을 받으면, Then 버튼 상태와 카운트가 클릭 이전으로 되돌아가고 에러 토스트가 표시된다.
- [ ] Given 이미 북마크한 항목에 대해, When 동일 사용자가 같은 target을 다시 북마크 추가 요청해도(더블클릭 등), Then 서버의 unique 제약으로 중복 행이 생기지 않고 최종 상태는 "북마크됨" 하나로 수렴한다.
- [ ] Given 페이지를 새로고침했을 때, When 상세 페이지가 다시 로드되면, Then 이전에 북마크한 상태가 유지되어 표시된다.

## 의존성

없음 — 선행 이슈. 이슈 #22, #23이 여기서 만든 `BookmarkButton`, `useBookmark`,
`/api/bookmarks`, `QueryProvider`를 그대로 재사용한다.

## 테스트 시나리오

### `GET /api/bookmarks`

- [정상] GET — should return isBookmarked:true and count when logged-in user has bookmarked the target
- [정상] GET — should return isBookmarked:false and count when logged-in user has not bookmarked the target
- [정상] GET — should return isBookmarked:false and public count when the request is unauthenticated
- [경계] GET — should return count:0 when the target has no bookmarks at all
- [예외] GET — should return 400 VALIDATION_ERROR when targetType is not 'template' or 'feature'
- [예외] GET — should return 400 VALIDATION_ERROR when targetType is 'feature' and targetId is not in the static feature list
- [예외] GET — should return 404 NOT_FOUND when targetType is 'template' and targetId does not exist in templates table

### `POST /api/bookmarks`

- [정상] POST — should insert a bookmark row and return isBookmarked:true with count+1 when the user has not bookmarked the target yet
- [정상] POST — should return 401 AUTH_REQUIRED when the request is unauthenticated
- [경계] POST — should return the current state as a 200 success (not an error) when the same user sends POST for a target already bookmarked (idempotent, unique_violation 23505 swallowed)
- [예외] POST — should return 400 VALIDATION_ERROR when targetType is invalid
- [예외] POST — should return 400 VALIDATION_ERROR when targetType is 'feature' and targetId is not in the static feature list
- [예외] POST — should return 404 NOT_FOUND when targetType is 'template' and targetId does not exist in templates table
- [예외] POST — should return 502 UPSTREAM_ERROR when the insert fails for a reason other than unique_violation

### `DELETE /api/bookmarks`

- [정상] DELETE — should remove the bookmark row and return isBookmarked:false with count-1 when the user has bookmarked the target
- [정상] DELETE — should return 401 AUTH_REQUIRED when the request is unauthenticated
- [경계] DELETE — should return the current state as a 200 success (not an error) when the same user sends DELETE for a target that is already not bookmarked (idempotent, 0 rows affected)
- [예외] DELETE — should return 400 VALIDATION_ERROR when targetType is invalid

### `bookmark-client` (`getBookmarkState` / `addBookmark` / `removeBookmark`)

- [정상] getBookmarkState — should call apiClient.get with the correct query string and return BookmarkState
- [정상] addBookmark — should call apiClient.post with the target in the request body and return BookmarkState
- [정상] removeBookmark — should call apiClient.delete with the correct query string and return BookmarkState
- [예외] getBookmarkState — should propagate ApiError thrown by apiClient without swallowing it

### `useBookmark`

- [정상] useBookmark — should initialize isBookmarked/count from initialData without firing an extra request when initialData is provided
- [정상] useBookmark — should optimistically flip isBookmarked to true and increment count immediately when toggle() is called from a not-bookmarked state
- [정상] useBookmark — should optimistically flip isBookmarked to false and decrement count immediately when toggle() is called from a bookmarked state
- [경계] useBookmark — should ignore a second toggle() call while isPending is true (prevent duplicate in-flight mutations from the same click)
- [예외] useBookmark — should roll back isBookmarked/count to the pre-click value when the mutation rejects
- [예외] useBookmark — should converge to the server's final state after onSettled invalidation even if a rapid double toggle briefly showed an intermediate optimistic value

### `BookmarkButton`

- [정상] BookmarkButton — should render as filled when isBookmarked is true and outlined when false
- [정상] BookmarkButton — should display the count next to the icon
- [정상] BookmarkButton — should call toggle() when clicked by an authenticated user
- [정상] BookmarkButton — should navigate to /auth/login when clicked by an unauthenticated user, without calling toggle()
- [예외] BookmarkButton — should show an error toast and keep the button visually reverted when the underlying mutation fails
- [경계] BookmarkButton — should be keyboard-operable (Enter/Space triggers the same click behavior) and expose an accessible label indicating bookmark state

### `templates/[id]` 상세 페이지 통합

> **Vitest 단위 테스트 대상에서 제외**: `TemplateDetailPage`는 async 서버 컴포넌트이며, 이
> 프로젝트는 기존에도 이런 async 서버 컴포넌트 페이지를 Vitest+RTL로 렌더링 테스트하지 않고
> Playwright E2E(`templates-detail.e2e.ts`)로 검증해왔다(선례 확인: 해당 페이지에 기존
> `.test.tsx` 파일 없음). 아래 시나리오는 tdd-red/tdd-green 단계의 Vitest 테스트로는 작성하지
> 않고, `templates-detail.e2e.ts`에 케이스를 추가하는 방식으로 다룬다(Green 단계에서 수행).

- [정상] TemplateDetailPage — should render BookmarkButton with isAuthenticated:true and the current user's bookmark state when a logged-in user requests the page
- [정상] TemplateDetailPage — should render BookmarkButton with isAuthenticated:false when an anonymous user requests the page
- [경계] TemplateDetailPage — should still show the correct bookmark state after a full page reload (state is not client-only)

## AC 커버리지 대조

| AC                                                    | 커버 시나리오                                                                                         |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 로그인 사용자가 클릭 → 즉시 채워짐 + count+1          | `useBookmark` 정상 시나리오 2, `BookmarkButton` 정상 시나리오 3                                       |
| 이미 북마크 → 재클릭 시 즉시 비워짐 + count-1         | `useBookmark` 정상 시나리오 3                                                                         |
| 비로그인 클릭 → `/auth/login` 이동                    | `BookmarkButton` 정상 시나리오 4                                                                      |
| API 실패 → 롤백 + 에러 토스트                         | `useBookmark` 예외 시나리오 1, `BookmarkButton` 예외 시나리오 1                                       |
| 더블클릭 등 중복 요청 → 최종 상태 "북마크됨"으로 수렴 | `POST` 경계 시나리오, `DELETE` 경계 시나리오, `useBookmark` 경계/예외 시나리오(중복 방지 + 최종 수렴) |
| 새로고침 후에도 북마크 상태 유지                      | `TemplateDetailPage` 경계 시나리오, `GET` 정상 시나리오 1/2                                           |

모든 AC가 최소 1개 이상의 시나리오로 커버됨을 확인했다.
