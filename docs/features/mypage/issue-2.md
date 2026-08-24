# Issue #31 — 내 북마크 목록 + 삭제

GitHub: https://github.com/psy0821-k/frontend-starter-kit/issues/31
PRD: [prd.md](./prd.md) · 확정 스펙: [spec-fixed.md](./spec-fixed.md)

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
 * 원본이 삭제되어 join 결과가 없는 북마크는 배열에서 제외한다(조용히 필터링).
 */
export async function getMyBookmarks(userId: string): Promise<MyBookmarkItem[]>;
```

### 북마크 목록 UI — `src/features/mypage/ui/my-bookmark-list.tsx`

```typescript
interface MyBookmarkListProps {
  items: MyBookmarkItem[];
}

export function MyBookmarkList(props: MyBookmarkListProps): JSX.Element;
```

- 항목이 비어있으면 빈 상태(empty state) 안내 문구를 표시한다.
- 각 항목에 타입 배지("템플릿" | "기능")와 삭제 버튼을 표시한다.
- 삭제 버튼은 기존 `removeBookmark`(`src/features/bookmark/api/bookmark-client.ts`)를 그대로
  호출한다 — 새 API를 만들지 않는다.
- 삭제 성공 시 목록에서 해당 항목을 즉시 제거한다(로컬 state 갱신, 별도 재조회 불필요).

## 설명

`/mypage`에 "내 북마크" 섹션을 추가한다. 이슈 1에서 만든 페이지 골격에 이어붙이는 형태다.
템플릿과 기능을 하나의 목록에 섞어서 타입 배지로 구분해 보여주고, 각 항목에서 바로 북마크를
해제(삭제)할 수 있다. 삭제 API는 새로 만들지 않고 기존 `/api/bookmarks` DELETE를 재사용한다.

## 변경 지점

- `src/features/mypage/api/get-my-bookmarks.ts` — 신규. `bookmarks` × `templates`/`features` join
- `src/features/mypage/ui/my-bookmark-list.tsx` — 신규
- `src/app/mypage/page.tsx` — `getMyBookmarks()` 호출 결과를 `MyBookmarkList`에 전달(수정)
- `supabase/migrations/` — 필요 시 `bookmarks(user_id, target_type)` 조건 조회용 인덱스 추가
  검토(현재 `bookmarks_target_idx`는 `(target_type, target_id)` 기준이라 `user_id` 조회에는
  풀스캔 가능성 있음 — 실제 필요 여부는 이슈 진행 중 EXPLAIN으로 확인)

## Acceptance Criteria

- [ ] Given 템플릿 2개와 기능 1개를 북마크한 사용자, When `/mypage`의 내 북마크 목록을 보면, Then 3개 항목이 타입 배지와 함께 표시된다.
- [ ] Given 북마크 목록의 한 항목, When 그 항목의 삭제 버튼을 클릭하면, Then 항목이 목록에서 사라지고 `bookmarks` 테이블에서도 삭제된다.
- [ ] Given 북마크한 템플릿이 관리자에 의해 이미 삭제된 상태, When 내 북마크 목록을 보면, Then 그 항목은 표시되지 않는다(에러도 표시되지 않음).
- [ ] Given 아무것도 북마크하지 않은 사용자, When 내 북마크 목록을 보면, Then 빈 상태 안내 문구가 표시된다.

## 의존성

이슈 1(`/mypage` 라우트, 인증 가드) — 그 골격 위에 섹션을 추가한다.
기존 `src/features/bookmark/api/bookmark-client.ts`의 `removeBookmark` — 신규 API 없이 재사용.
