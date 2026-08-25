# Issue #37 — [features] Feature 상세 페이지 북마크 연동

## 시그니처

새로 만드는 함수/컴포넌트/타입은 없다. 기존 `BookmarkButton`, `getBookmarkStateForServer`,
`getCurrentUser`를 `src/app/features/[id]/page.tsx`에 조합하는 것이 전부다
(`BookmarkTargetType`에 `'feature'`가 이미 포함되어 있어 타입 변경도 불필요).

### `src/app/features/[id]/page.tsx` 수정

```typescript
// 추가 import
import { getCurrentUser } from '@/shared/api/auth/get-current-user';
import { getBookmarkStateForServer } from '@/features/bookmark/api/get-bookmark-state-for-server';
import { BookmarkButton } from '@/features/bookmark/ui/bookmark-button';
```

- `FeatureDetailPage` 내부에서 `getFeatureById(id)`와 `getCurrentUser()`를 `Promise.all`로
  병렬 조회(`templates/[id]/page.tsx`와 동일 패턴).
- `bookmarkTarget = { targetType: 'feature' as const, targetId: feature.id }`
- `bookmarkState = await getBookmarkStateForServer(bookmarkTarget, currentUser?.id ?? null)`
- 헤더 영역(`<header>` 내부, 카테고리/태그 배지와 같은 줄)에
  `<BookmarkButton target={bookmarkTarget} initialData={bookmarkState} isAuthenticated={currentUser !== null} />`
  배치.

## 테스트 시나리오

새 함수/컴포넌트가 없으므로 별도 유닛 테스트 대상이 없다. `BookmarkButton`,
`getBookmarkStateForServer`, `useBookmark`는 이미 기존 테스트 스위트로 커버되어 있고
(`templates/[id]`에서 이미 검증된 재사용), 이번 이슈는 페이지 통합 지점만 다루므로
`page.test.ts`(이슈 #36에서 이미 존재)에 시나리오를 추가하고 E2E로 실제 클릭 흐름을
검증한다.

### `FeatureDetailPage` (page.test.ts, 통합)

- [정상] 로그인 상태이고 아직 북마크하지 않았을 때 `BookmarkButton`이
  `isAuthenticated=true`, `initialData.isBookmarked=false`로 렌더링되어야 한다
- [정상] 로그인 상태이고 이미 북마크했을 때 `BookmarkButton`이
  `initialData.isBookmarked=true`로 렌더링되어야 한다
- [경계] 비로그인 상태일 때 `BookmarkButton`이 `isAuthenticated=false`로 렌더링되어야 한다

### `/features/[id]` (E2E)

이 프로젝트에 로그인 세션을 가진 E2E 테스트 유틸/픽스처가 없어(기존 `templates-detail.e2e.ts`,
`features-detail.e2e.ts` 모두 인증 상태를 다루지 않음), 로그인 흐름 전체를 E2E로 새로 구축하는
것은 이번 이슈 범위를 벗어난다. 따라서 E2E는 **비로그인 사용자** 시나리오만 다루고, 로그인
이후 토글 동작(AC 1~3)은 `BookmarkButton`/`useBookmark`의 기존 유닛 테스트가 이미 커버하는
영역이므로 페이지 레벨에서는 "버튼이 렌더링되고 올바른 target으로 연결되는지"까지만 확인한다.

- [정상] 존재하는 Feature id로 접속하면 북마크 버튼이 화면에 렌더링되어야 한다
- [정상] 비로그인 상태에서 북마크 버튼을 클릭하면 로그인 페이지(`/auth/login`)로 이동해야 한다

## AC 커버리지 대조

| AC (이슈 #37)                                  | 커버 시나리오                                                                                                     |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 미북마크 상태에서 클릭 → "북마크됨"으로 변경   | `BookmarkButton`/`useBookmark` 기존 유닛 테스트(재사용, 신규 아님) + `page.test.ts` "isBookmarked=false로 렌더링" |
| 북마크 상태에서 클릭 → "북마크 안 됨"으로 변경 | `BookmarkButton`/`useBookmark` 기존 유닛 테스트(재사용) + `page.test.ts` "isBookmarked=true로 렌더링"             |
| 새로고침 시 북마크 상태로 초기 렌더링          | `page.test.ts` "isBookmarked=true로 렌더링" + E2E "북마크 버튼이 렌더링되어야 한다"                               |
| 비로그인 클릭 → 로그인 페이지 이동             | `page.test.ts` "isAuthenticated=false로 렌더링" + E2E "로그인 페이지로 이동해야 한다"                             |

**참고**: 클릭 시 실제 토글 동작(AC 1, 2의 "클릭하면 상태가 바뀐다") 자체는 `BookmarkButton`이
이미 `templates/[id]`에서 검증된 컴포넌트를 그대로 재사용하는 것이라 이번 이슈에서 새로
테스트하지 않는다. 이번 이슈가 실제로 검증해야 할 것은 "Feature 상세 페이지가 올바른
target(`targetType: 'feature'`)과 초기 상태로 `BookmarkButton`을 렌더링하는가"이며, 위
시나리오들이 이를 커버한다.
