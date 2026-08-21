# Bookmark Feature PRD

원본: [spec-original.md](./spec-original.md) · 확정 스펙: [spec-fixed.md](./spec-fixed.md)

---

## 개요

`templates`(DB 기반)와 `features`(정적 데이터) 양쪽에 좋아요/북마크 토글 기능(`BookmarkButton`)을
추가한다. 좋아요와 북마크는 하나의 토글로 통합하며, 클릭 시 낙관적 업데이트로 즉시 반응하고
카운트를 함께 표시한다. 이 기능이 프로젝트에 TanStack Query를 처음 도입하는 지점이다.

`FeatureCard`는 지금까지 클릭 동작이 없는 정보 표시 전용 카드였으나, 이번 기능으로 처음
상호작용 요소(북마크 버튼)가 추가된다.

## 사용자 스토리

1. 로그인한 사용자는 templates 목록 카드, features 카드, templates 상세 페이지에서 북마크
   버튼을 눌러 즉시 채워짐/비워짐 상태와 카운트 변화를 확인할 수 있다.
2. 사용자는 이미 북마크한 항목을 다시 눌러 북마크를 해제할 수 있다.
3. 비로그인 사용자가 북마크 버튼을 누르면 로그인 페이지로 이동한다.
4. 사용자는 네트워크 오류 등으로 북마크 요청이 실패하면 토스트로 실패 사실을 안내받고, 화면은
   실패 이전 상태로 되돌아간 것을 확인할 수 있다.
5. 사용자는 같은 항목을 여러 번 빠르게 눌러도 최종적으로 일관된 상태(정확히 켜짐 또는 꺼짐)를
   보게 된다.

## 구현 계획

| 영역                             | 구현 위치                                                        | 비고                                                      |
| -------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------- |
| DB 마이그레이션                  | `supabase/migrations/010_bookmarks.sql` (신규)                   | `bookmarks` 테이블, RLS, unique 제약                      |
| 북마크 API Route Handler         | `src/app/api/bookmarks/route.ts` (신규)                          | GET/POST/DELETE, `getCurrentUser()` 인증                  |
| 북마크 타입/모델                 | `src/features/bookmark/model/types.ts` (신규)                    | `BookmarkTargetType`, `BookmarkState` 등                  |
| 북마크 API 클라이언트            | `src/features/bookmark/api/bookmark-client.ts` (신규)            | fetch 래퍼, `ApiError` 매핑                               |
| TanStack Query Provider          | `src/app/query-provider.tsx` (신규), `src/app/layout.tsx` (수정) | 클라이언트 컴포넌트, `QueryClientProvider`                |
| 북마크 훅                        | `src/features/bookmark/model/use-bookmark.ts` (신규)             | `useQuery` + `useMutation`(onMutate/onError/onSettled)    |
| 북마크 목록 초기 상태 조회       | `src/features/bookmark/api/get-bookmarked-ids.ts` (신규)         | 서버 컴포넌트용, 로그인 사용자의 target_id 목록 일괄 조회 |
| 북마크 버튼 UI                   | `src/features/bookmark/ui/bookmark-button.tsx` (신규)            | 아이콘 + 카운트, `use-bookmark` 훅 사용                   |
| templates 상세 페이지 적용       | `src/app/templates/[id]/page.tsx` (수정)                         | 헤더 영역에 `BookmarkButton` 배치                         |
| templates 목록 카드 적용         | `src/features/starter-kit/ui/starter-kit-card.tsx` (수정)        | 카드에 `BookmarkButton` 배치, 클릭 이벤트 버블링 차단     |
| templates 목록 초기 하이드레이션 | `src/app/templates/page.tsx` (수정)                              | `get-bookmarked-ids`로 서버에서 조회 후 전달              |
| features 카드 적용               | `src/features/feature-catalog/ui/feature-card.tsx` (수정)        | 카드에 `BookmarkButton` 배치(카드 최초 상호작용 요소)     |
| features 목록 초기 하이드레이션  | `src/app/features/page.tsx` (수정)                               | `get-bookmarked-ids`로 서버에서 조회 후 전달              |
| 로그인 리다이렉트                | `src/features/bookmark/ui/bookmark-button.tsx`                   | 비로그인 시 `router.push('/auth/login')`                  |
| Toast 에러 안내                  | 기존 `shared/ui`의 Toast(shadcn) 재사용                          | 신규 컴포넌트 없음                                        |

## 기술 결정

### 결정 1 — 목록 페이지 초기 북마크 상태: 서버 일괄 조회 + `initialData` 하이드레이션

**Context** — spec-fixed.md §5-1-1은 "카드마다 개별 `useQuery`를 호출하면 N+1 쿼리가 발생하니
대안을 PRD 단계에서 확정하라"고 명시했다. templates 목록(최대 9개 노출 + 무한스크롤)과 features
목록(페이지네이션, 6개)은 한 화면에 여러 카드가 동시에 북마크 상태를 표시해야 한다.

| #   | 기준                 | 안 A: 서버 일괄 조회 + `initialData` 하이드레이션                                                                                                             | 안 B: 카드마다 개별 `useQuery`                                             | 안 C: 클라이언트에서 목록 전체를 한 번에 `useQuery`로 조회      |
| --- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------- |
| 1   | 데이터 구조          | 서버 컴포넌트가 로그인 사용자의 북마크 `target_id` 배열(Set)을 한 번에 조회해 클라이언트로 props 전달                                                         | 카드별로 `{ isBookmarked, count }` 개별 응답                               | 클라이언트에서 화면에 보이는 target_id 배열을 모아 한 번에 요청 |
| 2   | API 레이어 변경지점  | `GET /api/bookmarks`에 `targetType`만 넘기면 사용자의 전체 target_id 목록을 반환하는 모드 추가                                                                | 없음(기존 단건 조회 그대로)                                                | `GET /api/bookmarks`가 target_id 배열을 받는 배치 모드 필요     |
| 3   | 상태관리 변경지점    | 각 `BookmarkButton`의 `useQuery`에 서버에서 받은 값을 `initialData`로 주입                                                                                    | 없음                                                                       | 목록 컨테이너가 배치 조회 결과를 Context/props로 각 카드에 분배 |
| 4   | 핵심 동작            | 서버 컴포넌트(`page.tsx`)에서 `get-bookmarked-ids.ts` 호출 → 카드별 `BookmarkButton`이 `initialData`로 즉시 하이드레이션, 카운트는 카드별 개별 GET(아래 참고) | 카드가 마운트되는 순간 각자 GET 요청                                       | 목록 컨테이너가 마운트 시 배치 GET 1회, 결과를 각 카드에 배분   |
| 5   | 컴포넌트 구조        | `BookmarkButton`은 `initialData` prop만 받으면 되어 카드 컴포넌트 변경이 최소                                                                                 | `BookmarkButton`이 완전히 독립적이라 카드 수정이 가장 적음                 | 목록 컨테이너가 북마크 상태를 알아야 해서 관심사가 섞임         |
| 6   | 기존 패턴과의 일관성 | `templates/page.tsx`, `features/page.tsx`가 이미 서버 컴포넌트에서 데이터를 fetch해 자식에 내려주는 구조(`getStarterKits`, 정적 `data.ts`)와 동일한 패턴      | 기존 서버 fetch 패턴과 무관하게 클라이언트에서 추가 요청 발생              | 서버 컴포넌트가 하던 일을 클라이언트로 옮겨 기존 패턴과 어긋남  |
| 7   | 테스트 용이성        | `get-bookmarked-ids.ts`(순수 함수형 서버 API)와 `BookmarkButton`(주어진 initialData로 렌더)을 각각 독립 테스트 가능                                           | 각 카드 테스트 시 API 모킹 필요, 개수만큼 네트워크 호출 발생을 검증해야 함 | 배치 로직과 분배 로직이 얽혀 목록 컨테이너 테스트가 복잡해짐    |

**Decision** — 안 A. `src/features/bookmark/api/get-bookmarked-ids.ts`를 서버 전용 함수로 추가해
`templates/page.tsx`, `features/page.tsx`에서 로그인 사용자의 북마크된 `target_id` Set을
한 번에 조회한다. 각 카드는 이 값을 `isBookmarked` 초기값으로 받고, `BookmarkButton` 내부의
`useQuery`가 이 값을 `initialData`로 사용해 추가 GET 없이 즉시 렌더링된다. 카운트는 목록
화면에서는 초기 렌더 시 각 카드 데이터에 이미 포함되도록 함께 조회하고(상세 설계는 이슈
분해 단계에서 API 응답 스키마로 확정), 토글 이후의 캐시 갱신만 `useMutation`이 담당한다.

**Alternatives**

- 안 B(카드마다 개별 `useQuery`): 구현이 가장 단순하지만 목록에 카드가 N개면 페이지 진입 시
  N번의 네트워크 요청이 동시에 발생한다(N+1 문제 그 자체). spec-fixed.md가 이미 이 문제를
  피하라고 명시했으므로 기각.
- 안 C(클라이언트 배치 조회): N+1은 피하지만, 서버 컴포넌트가 이미 templates/features 데이터를
  들고 있는 상황에서 클라이언트가 별도로 같은 정보를 다시 요청하는 왕복이 추가된다. 또한
  목록 컨테이너가 "북마크 상태 분배"라는 책임을 새로 떠안아 컴포넌트 관심사가 섞인다(카드
  컴포넌트가 독립적으로 재사용 가능해야 한다는 기존 원칙과 어긋남). 기각.

**Consequences**

- 장점: 목록 진입 시 추가 네트워크 요청이 없어 빠르고, 기존 서버 컴포넌트 fetch 패턴을
  그대로 확장하는 형태라 코드베이스 일관성이 높다. `BookmarkButton`은 `initialData`가 있으면
  즉시, 없으면(SSR 데이터가 없는 예외적 상황) 자체 `useQuery`로 채우는 이중 경로를 가져
  독립 컴포넌트로도 재사용 가능하다.
- 단점: `get-bookmarked-ids.ts`가 templates/features 두 도메인의 목록 페이지에 각각 연결되어야
  하므로, 두 `page.tsx` 모두 약간의 서버 fetch 코드가 추가된다(단, 이는 무시할 수준). 또한
  `bookmarks` 테이블에 대한 `target_type` 조건부 조회 인덱스가 필요해진다(이슈 분해 시 마이그레이션에
  반영).

## Out of Scope

spec-fixed.md §7의 Out of Scope를 그대로 따른다. 추가되는 항목:

- 목록 카드 상의 북마크 카운트 실시간 동기화(다른 사용자가 방금 누른 북마크가 내 화면에
  자동 반영되는 것) — 최초 로드 시점 값만 표시, 새로고침 전까지 갱신 없음.
- `get-bookmarked-ids.ts`의 페이지네이션/무한스크롤 대응 최적화(예: 커서 기반 배치) — 현재
  목록 규모(9개, 6개)에서는 전체 조회로 충분.

## 용어 정의

spec-fixed.md의 용어 정의를 그대로 따른다. 추가되는 용어:

| 용어                       | 정의                                                                                                                              |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `get-bookmarked-ids`       | 서버 컴포넌트에서 로그인 사용자의 북마크된 target_id 목록을 일괄 조회하는 함수(`src/features/bookmark/api/get-bookmarked-ids.ts`) |
| `initialData` 하이드레이션 | 서버에서 미리 조회한 값을 TanStack Query의 `initialData`로 주입해 클라이언트 첫 렌더에 추가 요청 없이 상태를 채우는 방식          |

## 관련 문서

- [spec-original.md](./spec-original.md) — 초기 아이디어
- [spec-fixed.md](./spec-fixed.md) — 확정 요구사항, 캐싱 전략, 용어 정의
