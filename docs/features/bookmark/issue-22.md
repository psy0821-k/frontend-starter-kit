# Issue #22 — templates 목록 카드 북마크 버튼 + 초기 하이드레이션

GitHub: https://github.com/psy0821-k/frontend-starter-kit/issues/22
PRD: [prd.md](./prd.md) · 선행 이슈: [issue-21.md](./issue-21.md)

## 설명

`StarterKitCard`에 `BookmarkButton`을 배치하고, `templates/page.tsx`에서
`get-bookmarked-ids`로 로그인 사용자의 북마크된 template id를 일괄 조회해 각 카드에
`initialData`로 하이드레이션한다(PRD 결정 1, 안 A). 카드 클릭(상세 이동)과 북마크 버튼 클릭이
서로 이벤트를 가로채지 않도록 처리한다.

## 변경 지점

- `src/features/bookmark/api/get-bookmarked-ids.ts` — 신규. 서버 전용, 로그인 사용자의 특정
  `target_type`에 대한 북마크된 `target_id` Set을 일괄 조회
- `src/app/templates/page.tsx` — `get-bookmarked-ids('template')` 호출 후 목록 컴포넌트에 전달
- `src/features/starter-kit/ui/starter-kit-infinite-list.tsx` — 북마크 초기 상태를 카드별로 전달
- `src/features/starter-kit/ui/starter-kit-card.tsx` — `BookmarkButton` 배치, 클릭 시
  `stopPropagation`으로 카드 자체의 상세 이동 이벤트와 분리

## Acceptance Criteria

- [ ] Given 로그인 사용자가 이전에 특정 템플릿 3개를 북마크한 상태에서, When `/templates` 목록에 접속하면, Then 해당 3개 카드의 북마크 버튼만 채워진 상태로 초기 렌더링된다(추가 로딩 지연 없이).
- [ ] Given 목록 카드 위에서, When 북마크 버튼을 클릭하면, Then 카드 클릭(상세 페이지 이동)은 발생하지 않고 북마크만 토글된다.
- [ ] Given 목록 카드에서 북마크를 토글한 뒤, When 해당 카드의 상세 페이지로 이동하면, Then 상세 페이지의 북마크 버튼도 동일하게 토글된 상태로 보인다.
- [ ] Given 무한스크롤로 추가 카드가 로드될 때, When 새 카드가 화면에 나타나면, Then 새로 로드된 카드도 올바른 초기 북마크 상태를 보여준다.

## 의존성

이슈 #21(`BookmarkButton`, `useBookmark`, `/api/bookmarks`) — 이 컴포넌트/훅을 그대로 재사용한다.
