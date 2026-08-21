# Issue #23 — features 카드 북마크 버튼 + 초기 하이드레이션

GitHub: https://github.com/psy0821-k/frontend-starter-kit/issues/23
PRD: [prd.md](./prd.md) · 선행 이슈: [issue-21.md](./issue-21.md)

## 설명

`FeatureCard`에 `BookmarkButton`을 배치한다. `FeatureCard`는 지금까지 클릭 동작이 없는 정보
표시 전용 카드였으므로, 이번이 카드 최초의 상호작용 요소 추가다. `features/page.tsx`에서
`get-bookmarked-ids('feature')`로 초기 하이드레이션한다.

## 변경 지점

- `src/app/features/page.tsx` — `get-bookmarked-ids('feature')` 호출 후 목록에 전달
- `src/features/feature-catalog/ui/feature-list.tsx` — 북마크 초기 상태를 카드별로 전달
- `src/features/feature-catalog/ui/feature-card.tsx` — `BookmarkButton` 배치(target_id는
  `Feature.id` 정적 slug 사용)

## Acceptance Criteria

- [ ] Given 로그인 사용자가 이전에 특정 feature를 북마크한 상태에서, When `/features` 목록에 접속하면, Then 해당 카드의 북마크 버튼이 채워진 상태로 초기 렌더링된다.
- [ ] Given `/features` 카드에서, When 북마크 버튼을 클릭하면, Then 버튼 상태와 카운트가 즉시 토글된다(카드 자체에는 다른 클릭 동작이 없으므로 이벤트 충돌 검증 불필요).
- [ ] Given 페이지네이션으로 다음 페이지로 이동했을 때, When 새 페이지의 카드가 표시되면, Then 해당 카드들도 올바른 초기 북마크 상태를 보여준다.
- [ ] Given 비로그인 사용자가 `/features`에 접속했을 때, When 북마크 버튼을 클릭하면, Then `/auth/login`으로 이동한다(이슈 #21의 동작이 features 카드에서도 동일하게 적용됨을 확인).

## 의존성

이슈 #21(`BookmarkButton`, `useBookmark`, `/api/bookmarks`) — 이 컴포넌트/훅을 그대로 재사용한다.
이슈 #22와는 독립적으로 병렬 진행 가능하다.
