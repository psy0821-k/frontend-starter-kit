# Features 메뉴 목록 페이지 — 확정 요구사항

**작성일**: 2026-08-11
**상위 문서**: [spec-original.md](./spec-original.md)

---

## 1. 개요

`/features`는 routing.md에서 정의한 "특정 페이지에 종속되지 않는 재사용 가능한 기능
모듈(search, board, comment, payment, notification 등)"을 소개하는 목록 페이지다.
현재 `src/app/features/`는 미구현 상태이며, 이번 범위는 **목록 조회 페이지 신규 작성**이다.

`/templates` 목록 페이지(검색 + 카테고리 필터, `src/features/starter-kit/`)의 UX 패턴을
검색·카테고리 필터에 한해 재사용하되, Feature 도메인 데이터는 아직 DB 테이블이 없으므로
**정적 하드코딩 목록**으로 시작한다.

**목록 순회 방식은 templates와 다르게 간다**: templates는 DB 기반 탐색형 카탈로그라
무한스크롤을 유지하고, features는 정적이고 항목 수가 적은 참조형 목록이라
**페이지네이션**을 사용한다. 두 메뉴는 데이터 소스(DB vs 정적)와 사용 목적(탐색 vs 검색)이
달라 억지로 통일하지 않는다 — 실제로 동일 요구가 재현될 때만 커널로 승격한다는
"2회 규칙"과 일치한다.

---

## 2. 최소 동작 시나리오

1. 사용자가 `/features`에 진입하면 1페이지(최대 6개) Feature 카드 목록이 보인다.
2. 사용자가 검색어를 입력하면 이름/설명에 검색어가 포함된 Feature만 필터링되어 1페이지부터 다시 보인다.
3. 사용자가 카테고리를 선택하면 해당 카테고리의 Feature만 필터링되어 1페이지부터 다시 보인다.
4. 검색어와 카테고리 필터는 동시에 적용될 수 있다(AND 조건).
5. 필터 결과가 0개면 빈 상태(empty state) UI가 표시된다.
6. 사용자가 페이지네이션 컨트롤에서 다음/이전 페이지 또는 특정 페이지 번호를 클릭하면 해당 페이지의 카드가 보인다.

---

## 3. 데이터 소스 및 구조

- **위치**: `src/features/feature-catalog/`(새 도메인 슬라이스, `starter-kit`과 독립).
  - `model/`: Feature 타입 정의, 정적 데이터 배열, 카테고리 상수.
  - `ui/`: 카드, 검색 입력, 카테고리 필터, 빈 상태 컴포넌트.
- **이유**: 지금은 하드코딩이지만 나중에 실제 DB(features 테이블)로 전환할 때
  `api/` 레이어만 추가하면 되도록, `starter-kit`과 동일한 슬라이스 구조를 처음부터 따른다.
- 무한스크롤은 포함하지 않는다 — 대신 페이지네이션을 사용한다(§5-1).

---

## 4. 카드 필드 (최소)

| 필드        | 타입   | 필수 | 설명                     |
| ----------- | ------ | ---- | ------------------------ |
| id          | string | Y    | 고유 식별자 (slug)       |
| title       | string | Y    | Feature 이름             |
| description | string | Y    | 한두 문장 설명           |
| category    | string | Y    | 아래 카테고리 값 중 하나 |

아이콘·태그·상세 페이지 링크는 이번 범위에 포함하지 않는다 (§7 Out of Scope 후보).

---

## 5. 카테고리

routing.md의 Feature 예시를 그대로 사용한다: `search`, `board`, `comment`,
`payment`, `notification`. 카테고리 상수는 `feature-catalog/model/constants.ts`에
정의하고, `starter-kit`의 카테고리 필터 패턴(`StarterKitCategoryFilter`)을 참고해
구현한다.

---

## 5-1. 페이지네이션

- **페이지당 카드 수**: 6개.
- **상태 위치**: URL 쿼리스트링(`?page=2`). `templates`의 `searchParams`(`category`, `q`)
  패턴과 일관되게 `page`도 서버 컴포넌트에서 읽어 처리한다.
- 검색어/카테고리 필터가 바뀌면 `page`는 1로 초기화한다.
- 필터링된 결과 기준으로 총 페이지 수를 계산한다(클라이언트 슬라이싱 — 정적 데이터라
  서버 페칭 불필요).

---

## 6. 카드 클릭 동작

없음. 이번 범위는 목록 페이지만이며, 카드는 정보 표시 전용이다(클릭 시 이동/모달 없음).
상세 페이지(`/features/[id]`)는 이번 범위에 포함하지 않는다.

---

## 7. 에러/빈 상태

검색·필터 결과가 0개일 때 `starter-kit`의 `StarterKitFilteredEmptyState` 패턴을
재사용해 동일한 UX(검색어/필터 초기화 안내)를 제공한다. 정적 데이터이므로 네트워크
에러 케이스는 없다.

---

## 8. 기존 UI 패턴 재사용

- `StarterKitCategoryFilter` → Feature 카테고리 필터의 구조적 참고.
- `StarterKitSearchInput` → 검색 입력의 구조적 참고.
- `StarterKitFilteredEmptyState` → 빈 상태 UI의 구조적 참고.
- `StarterKitCard` → Feature 카드의 구조적 참고(단, 필드가 더 단순함).

동일 컴포넌트를 직접 재사용하지 않고 Feature 도메인 전용 컴포넌트로 새로 작성한다
(도메인 데이터 타입이 다르므로). UI 셸(`shared/ui`)은 공유한다.

페이지네이션 컨트롤(`shadcn/ui`에 있다면 해당 컴포넌트, 없다면 신규 작성)은 `starter-kit`에
선례가 없으므로 이번 이슈에서 새로 만든다 — "2회 규칙"에 따라 `shared/ui` 승격은 보류하고
우선 `feature-catalog/ui/`에 둔다.

---

## 9. Out of Scope (1차 확정 후보 — 단계 2에서 최종 확정)

- 상세 페이지(`/features/[id]`)
- 무한스크롤 (대신 페이지네이션 채택)
- DB 연동(features 테이블)
- 아이콘/태그 표시
- 관리자용 생성/수정/삭제
- 페이지네이션 컨트롤의 `shared/ui` 승격 (2회 규칙 미충족)

---

## 10. 용어 정의 (Ubiquitous Language)

| 용어            | 의미                                                                        |
| --------------- | --------------------------------------------------------------------------- |
| Feature         | 특정 페이지에 종속되지 않는 재사용 가능한 기능 모듈 (routing.md 정의)       |
| Feature Catalog | 이번에 신설하는 도메인 슬라이스 이름 (`feature-catalog`)                    |
| 카테고리        | Feature를 분류하는 고정 값 집합 (search/board/comment/payment/notification) |
