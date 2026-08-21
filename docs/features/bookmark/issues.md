# Bookmark Feature 이슈 분해

PRD([prd.md](./prd.md)) 기준. 수직 슬라이스 3개로 나눈다. 이슈 #21(DB + API + TanStack Query
Provider + 훅 + templates 상세 버튼)이 나머지 모든 이슈의 기반이므로 반드시 먼저 진행한다.
이슈 #22(templates 목록)와 이슈 #23(features 카드)은 서로 다른 화면 영역이라 이슈 #21 완료 후
병렬 진행 가능하다.

GitHub Issue 등록 완료. 개별 상세는 각 `issue-{N}.md` 참조:

- [issue-21.md](./issue-21.md) — https://github.com/psy0821-k/frontend-starter-kit/issues/21
- [issue-22.md](./issue-22.md) — https://github.com/psy0821-k/frontend-starter-kit/issues/22
- [issue-23.md](./issue-23.md) — https://github.com/psy0821-k/frontend-starter-kit/issues/23

---

## 이슈 #21 — 북마크 기반 구축 + templates 상세 페이지 버튼

### 설명

`bookmarks` 테이블, `/api/bookmarks` Route Handler, TanStack Query Provider(프로젝트 첫 도입),
`useBookmark` 훅, `BookmarkButton` 컴포넌트를 모두 만들고, `templates/[id]` 상세 페이지에
적용한다. 이 이슈가 완료되면 로그인 사용자가 템플릿 상세 페이지에서 북마크를 토글하고 카운트를
확인할 수 있다(사용자에게 보이는 완결된 동작).

### 변경 지점

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

### Acceptance Criteria

- [ ] Given 로그인한 사용자가 아직 북마크하지 않은 템플릿 상세 페이지에 있을 때, When 북마크 버튼을 클릭하면, Then 버튼이 즉시 채워진 상태로 바뀌고 카운트가 1 증가한다.
- [ ] Given 이미 북마크한 템플릿 상세 페이지에 있을 때, When 북마크 버튼을 다시 클릭하면, Then 버튼이 즉시 비워진 상태로 바뀌고 카운트가 1 감소한다.
- [ ] Given 비로그인 사용자가 템플릿 상세 페이지에 있을 때, When 북마크 버튼을 클릭하면, Then `/auth/login` 페이지로 이동한다.
- [ ] Given 북마크 버튼을 클릭했으나 API 요청이 실패하는 상황일 때, When 실패 응답을 받으면, Then 버튼 상태와 카운트가 클릭 이전으로 되돌아가고 에러 토스트가 표시된다.
- [ ] Given 이미 북마크한 항목에 대해, When 동일 사용자가 같은 target을 다시 북마크 추가 요청해도(더블클릭 등), Then 서버의 unique 제약으로 중복 행이 생기지 않고 최종 상태는 "북마크됨" 하나로 수렴한다.
- [ ] Given 페이지를 새로고침했을 때, When 상세 페이지가 다시 로드되면, Then 이전에 북마크한 상태가 유지되어 표시된다.

### 의존성

없음 — 선행 이슈. 이슈 2, 3이 여기서 만든 `BookmarkButton`, `useBookmark`, `/api/bookmarks`,
`QueryProvider`를 그대로 재사용한다.

---

## 이슈 2 — templates 목록 카드 북마크 버튼 + 초기 하이드레이션

### 설명

`StarterKitCard`에 `BookmarkButton`을 배치하고, `templates/page.tsx`에서
`get-bookmarked-ids`로 로그인 사용자의 북마크된 template id를 일괄 조회해 각 카드에
`initialData`로 하이드레이션한다(PRD 결정 1, 안 A). 카드 클릭(상세 이동)과 북마크 버튼 클릭이
서로 이벤트를 가로채지 않도록 처리한다.

### 변경 지점

- `src/features/bookmark/api/get-bookmarked-ids.ts` — 신규. 서버 전용, 로그인 사용자의 특정
  `target_type`에 대한 북마크된 `target_id` Set을 일괄 조회
- `src/app/templates/page.tsx` — `get-bookmarked-ids('template')` 호출 후 목록 컴포넌트에 전달
- `src/features/starter-kit/ui/starter-kit-infinite-list.tsx` — 북마크 초기 상태를 카드별로 전달
- `src/features/starter-kit/ui/starter-kit-card.tsx` — `BookmarkButton` 배치, 클릭 시
  `stopPropagation`으로 카드 자체의 상세 이동 이벤트와 분리

### Acceptance Criteria

- [ ] Given 로그인 사용자가 이전에 특정 템플릿 3개를 북마크한 상태에서, When `/templates` 목록에 접속하면, Then 해당 3개 카드의 북마크 버튼만 채워진 상태로 초기 렌더링된다(추가 로딩 지연 없이).
- [ ] Given 목록 카드 위에서, When 북마크 버튼을 클릭하면, Then 카드 클릭(상세 페이지 이동)은 발생하지 않고 북마크만 토글된다.
- [ ] Given 목록 카드에서 북마크를 토글한 뒤, When 해당 카드의 상세 페이지로 이동하면, Then 상세 페이지의 북마크 버튼도 동일하게 토글된 상태로 보인다.
- [ ] Given 무한스크롤로 추가 카드가 로드될 때, When 새 카드가 화면에 나타나면, Then 새로 로드된 카드도 올바른 초기 북마크 상태를 보여준다.

### 의존성

이슈 1(`BookmarkButton`, `useBookmark`, `/api/bookmarks`) — 이 컴포넌트/훅을 그대로 재사용한다.

---

## 이슈 3 — features 카드 북마크 버튼 + 초기 하이드레이션

### 설명

`FeatureCard`에 `BookmarkButton`을 배치한다. `FeatureCard`는 지금까지 클릭 동작이 없는 정보
표시 전용 카드였으므로, 이번이 카드 최초의 상호작용 요소 추가다. `features/page.tsx`에서
`get-bookmarked-ids('feature')`로 초기 하이드레이션한다.

### 변경 지점

- `src/app/features/page.tsx` — `get-bookmarked-ids('feature')` 호출 후 목록에 전달
- `src/features/feature-catalog/ui/feature-list.tsx` — 북마크 초기 상태를 카드별로 전달
- `src/features/feature-catalog/ui/feature-card.tsx` — `BookmarkButton` 배치(target_id는
  `Feature.id` 정적 slug 사용)

### Acceptance Criteria

- [ ] Given 로그인 사용자가 이전에 특정 feature를 북마크한 상태에서, When `/features` 목록에 접속하면, Then 해당 카드의 북마크 버튼이 채워진 상태로 초기 렌더링된다.
- [ ] Given `/features` 카드에서, When 북마크 버튼을 클릭하면, Then 버튼 상태와 카운트가 즉시 토글된다(카드 자체에는 다른 클릭 동작이 없으므로 이벤트 충돌 검증 불필요).
- [ ] Given 페이지네이션으로 다음 페이지로 이동했을 때, When 새 페이지의 카드가 표시되면, Then 해당 카드들도 올바른 초기 북마크 상태를 보여준다.
- [ ] Given 비로그인 사용자가 `/features`에 접속했을 때, When 북마크 버튼을 클릭하면, Then `/auth/login`으로 이동한다(이슈 1의 동작이 features 카드에서도 동일하게 적용됨을 확인).

### 의존성

이슈 1(`BookmarkButton`, `useBookmark`, `/api/bookmarks`) — 이 컴포넌트/훅을 그대로 재사용한다.
이슈 2와는 독립적으로 병렬 진행 가능하다.
