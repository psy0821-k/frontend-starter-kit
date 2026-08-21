# 좋아요/북마크 기능 — 확정 요구사항

**작성일**: 2026-08-21
**상위 문서**: [spec-original.md](./spec-original.md)

---

## 1. 개요

`templates`(DB 기반)와 `features`(정적 데이터) 양쪽에 좋아요/북마크 토글 기능을 추가한다.
"좋아요"와 "북마크"는 별개 개념으로 분리하지 않고 **하나의 토글 기능**으로 통합한다 —
버튼 클릭 = 저장 + 선호 표시를 동시에 수행.

---

## 2. 최소 동작 시나리오

1. 로그인한 사용자가 목록 카드(templates 목록의 `StarterKitCard`, features의 `FeatureCard`) 또는
   상세 페이지(`templates/[id]`)에서 북마크 버튼을 클릭하면, 즉시 버튼 상태(채워짐/비워짐)와
   카운트가 바뀐다(낙관적 업데이트). 이후 백그라운드에서 API가 호출된다.
2. 이미 북마크한 항목을 다시 클릭하면 북마크가 해제된다(토글).
3. 비로그인 사용자가 버튼을 클릭하면 `/auth/login`으로 이동한다(기존 `requireAdmin` 계열 가드와
   유사한 리다이렉트 패턴).
4. API 요청이 실패하면 낙관적 업데이트를 롤백하고 토스트로 에러 메시지를 표시한다.
5. 동일 사용자가 같은 항목을 더블클릭 등으로 연속 요청해도 최종 상태는 일관되게 수렴한다
   (서버는 `unique(user_id, target_type, target_id)` 제약으로 중복 삽입을 방지하고,
   클라이언트는 현재 토글 상태를 보고 POST/DELETE 중 하나를 결정한다).

---

## 3. 데이터 저장 구조

### 3.1 공통 `bookmarks` 테이블

- `templates`(DB 테이블 존재)와 `features`(정적 하드코딩, DB 테이블 없음) 양쪽을 하나의 테이블로
  관리한다. `features`에 DB 테이블이 생기기 전까지 `target_id`는 FK 없이 정적 slug(`Feature.id`)를
  값으로만 저장한다.

```
bookmarks
├─ id          uuid primary key
├─ user_id     uuid not null references auth.users(id) on delete cascade
├─ target_type text not null check (target_type in ('template', 'feature'))
├─ target_id   text not null   -- template: uuid 문자열, feature: 정적 slug
├─ created_at  timestamptz not null default now()
└─ unique (user_id, target_type, target_id)
```

- `target_type = 'template'`일 때만 애플리케이션 레벨에서 `templates.id` 존재 여부를 검증한다
  (DB FK는 두 타입을 한 컬럼으로 섞어야 해서 불가능 — polymorphic association의 알려진 한계).
- `target_type = 'feature'`일 때는 `feature-catalog/model/data.ts`의 정적 목록에 해당 id가
  있는지만 애플리케이션에서 확인한다.

### 3.2 카운트 집계

- 비정규화 카운트 컬럼을 두지 않는다. 카운트가 필요한 곳(카드, 상세 페이지)에서 매번
  `bookmarks`에 `count(*)`(target_type + target_id 기준)로 조회한다.
- 트래픽 규모상 카운트 캐싱은 이번 범위에서 다루지 않는다(§7 Out of Scope).

---

## 4. API 설계

- 공통 엔드포인트 `/api/bookmarks`를 사용한다(대상별 하위 라우트로 분리하지 않음).
  - `POST /api/bookmarks` — body: `{ targetType: 'template' | 'feature', targetId: string }` → 북마크 추가.
  - `DELETE /api/bookmarks?targetType=...&targetId=...` — 북마크 해제.
  - `GET /api/bookmarks?targetType=...&targetId=...` — 현재 사용자의 북마크 여부 + 전체 카운트 조회
    (목록/상세 페이지 초기 렌더 시 사용).
- 인증은 기존 `getCurrentUser()`(`src/shared/api/auth/get-current-user.ts`) 패턴을 따른다.
  비로그인 상태에서 API가 직접 호출되면 401을 반환한다(버튼 클릭 시 프론트에서 이미 로그인
  페이지로 보내므로, API의 401은 방어적 계층).
- 에러는 기존 `ApiError` 클래스 + `ApiErrorCode` 유니온 규칙을 따른다.

---

## 5. 프론트엔드 동작

- 토글 클릭 시 즉시 로컬 상태(버튼 아이콘, 카운트)를 반영하고 API를 백그라운드 호출한다
  (낙관적 업데이트).
- API 실패 시 이전 상태로 롤백하고, 기존 `shared/ui`의 Toast(shadcn 기반)로 에러 메시지를
  표시한다.
- 카운트는 화면에 표시한다(예: "♥ 12"). 매 클릭마다 새로 GET하지 않고, 낙관적으로 ±1 계산 후
  실패 시에만 롤백한다.

---

## 5-1. 캐싱 전략

### 5-1-1. TanStack Query 도입 (이번 기능이 첫 도입 지점)

- `package.json`에는 `@tanstack/react-query`가 이미 설치되어 있으나(v5.101.4), 프로젝트 전체에
  `QueryClientProvider`나 `useQuery`/`useMutation` 사용처가 아직 없다. **이번 bookmark 기능이
  TanStack Query의 첫 실제 도입 지점**이다.
- 루트 레이아웃(`src/app/layout.tsx`)에 `QueryClientProvider`를 추가한다(클라이언트 컴포넌트로
  분리된 Provider 래퍼 필요 — App Router 관례).
- `GET /api/bookmarks?targetType=...&targetId=...`(북마크 여부 + 카운트)를 `useQuery`로 조회한다.
  - `queryKey`: `['bookmark', targetType, targetId]`.
  - 사용자별로 다른 값(로그인 여부에 따라 응답이 달라짐)이므로 `staleTime`은 짧게(예: 0 또는
    수십 초) 두고, 화면 이동/포커스 시 최신 상태를 신뢰할 수 있게 한다.
- 토글은 `useMutation`으로 구현하고, `onMutate`에서 `queryClient.setQueryData`로 캐시를 직접
  갱신해 낙관적 업데이트를 수행한다. `onError`에서 `onMutate`가 반환한 이전 값으로 롤백한다.
  `onSettled`에서 해당 `queryKey`를 `invalidateQueries`로 재검증한다.
- 목록 페이지(다수의 카드)에서는 카드마다 개별 `useQuery`를 호출하는 대신, 초기 로딩 시 서버
  컴포넌트에서 현재 사용자의 북마크 target_id 목록을 한 번에 가져와 `initialData`로 하이드레이션하는
  방식을 검토한다(N+1 쿼리 방지) — 상세 설계는 PRD 기술 결정(ADR) 단계에서 확정한다.

### 5-1-2. `use cache`(Next.js Cache Components)는 채택하지 않는다

- `next.config.ts`에 `cacheComponents` 옵션이 아직 활성화되어 있지 않아 이번 범위에서 바로 쓸 수
  없다.
- 설정을 켜더라도, `use cache`는 "여러 요청/사용자에 걸쳐 재사용 가능한 데이터"를 캐싱하는
  용도다. 북마크 여부는 **로그인 사용자마다 다른 값**이고, 카운트는 **매 클릭마다 즉시 갱신되어야
  하는 값**이라 서버 캐시 계층에 넣기보다 클라이언트 상태(TanStack Query 캐시)로 관리하는 편이
  이번 요구사항(낙관적 업데이트)과 맞는다.
- 따라서 이번 기능에서는 `use cache`를 사용하지 않는다. 프로젝트 전체의 `use cache` 도입 여부는
  이 기능과 무관하게 별도로 검토한다(Out of Scope).

---

## 6. 도메인 슬라이스 위치

- `src/features/bookmark/` 신설. `templates`/`features` 어느 한쪽에 종속되지 않는 재사용 기능
  모듈이므로 routing.md의 "Feature" 개념에 부합한다.
  - `api/` — `/api/bookmarks` 호출 클라이언트 함수.
  - `model/` — 타입(`BookmarkTargetType` 등), 토글 상태 로직.
  - `ui/` — `BookmarkButton`(아이콘 + 카운트) 컴포넌트. `templates`/`features` 카드와 상세
    페이지에서 각각 이 컴포넌트를 import해 사용한다(도메인 전용 컴포넌트를 새로 만들지 않음 —
    `bookmark`가 이미 공용 기능 모듈이므로).

---

## 7. Out of Scope (1차 확정 후보 — 단계 2에서 최종 확정)

- **"내 북마크 목록" 모아보기 페이지** — 추후 마이페이지 메뉴에서 별도 기능으로 다룬다
  (이번 범위 아님).
- 북마크 카운트의 비정규화/캐싱(트리거, 카운트 컬럼 등) — 트래픽 증가 시 재검토.
- 좋아요/북마크를 별개 개념으로 분리하는 것 — 이번엔 하나로 통합.
- `templates`/`features` 외 다른 대상(예: 댓글, 유저 프로필)으로의 확장.
- `next.config.ts`의 `cacheComponents`(`use cache`) 활성화 — 이번 기능과 무관하게 별도 검토.
- 프로젝트 전역에 걸친 TanStack Query 마이그레이션(기존 서버 컴포넌트 fetch 로직을 모두
  TanStack Query로 옮기는 것) — 이번 범위는 bookmark 기능에서만 도입.

---

## 8. 용어 정의 (Ubiquitous Language)

| 용어                               | 의미                                                                                             |
| ---------------------------------- | ------------------------------------------------------------------------------------------------ |
| 북마크(Bookmark)                   | 좋아요와 북마크를 통합한 단일 토글 기능. 이 문서 이후 "좋아요"라는 표현 대신 "북마크"로 통일한다 |
| target                             | 북마크 대상. `target_type`(template/feature) + `target_id`로 식별                                |
| 토글(Toggle)                       | 북마크 추가/해제를 오가는 단일 클릭 동작                                                         |
| 낙관적 업데이트(Optimistic Update) | API 응답을 기다리지 않고 클릭 즉시 UI를 반영하는 방식                                            |
| TanStack Query                     | 서버 상태(캐싱·재검증·낙관적 업데이트)를 관리하는 라이브러리. 이번 기능에서 최초 도입            |
