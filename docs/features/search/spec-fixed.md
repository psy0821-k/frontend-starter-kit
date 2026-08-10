# Search Feature 요구사항 정의서 (확정)

## 배경

`docs/routing.md`의 `/features`는 특정 페이지에 종속되지 않는 재사용 가능한 기능(Module) 모음이며, 현재 실제 콘텐츠가 없다.
이번 작업은 `/features`의 **첫 번째 feature**로 검색(Search)을 추가한다. 목록 페이지(`/features`)와 상세 페이지(`/features/search`) 구조는 `/templates`, `/templates/[id]` 패턴을 재사용한다.

`src/features/starter-kit/CLAUDE.md`에 이미 "Feature는 Template과 별도 테이블로 갈 예정이며, 코드 뷰어(`starter-kit-code-viewer.tsx`)는 Feature에서도 재사용 가능하게 설계됨"이라고 명시되어 있어, 이 방향과 일치한다.

---

## Ubiquitous Language (용어 정의)

| 용어             | 의미                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------ |
| Feature          | `/features`에 진열되는, 특정 페이지에 종속되지 않는 재사용 가능한 기능 모듈                      |
| Search Feature   | 이번에 추가하는 첫 Feature. 검색 UX 두 가지 방식(Live/Navigate)을 데모로 보여준다                |
| Live 모드        | 체크박스 선택 시, 입력할 때마다 클라이언트에서 즉시 목록을 필터링하는 검색 방식                  |
| Navigate 모드    | 체크박스 선택 시, submit(Enter)해야 URL query params(`?q=`)를 반영하고 페이지 이동하는 검색 방식 |
| Debounce 전략    | 입력이 멈춘 뒤 일정 시간(300ms) 후에만 필터링을 실행하는 지연 전략                               |
| Throttle 전략    | 입력 중에도 일정 주기(예: 300ms)마다 한 번씩 필터링을 실행하는 주기 전략                         |
| 검색 대상 데이터 | `/templates`가 사용하는 기존 StarterKit 목록(mock 포함)을 그대로 재사용                          |

---

## 기능 요구사항

### 1. `/features` 목록 페이지

- 등록된 Feature를 카드(Card)로 그리드 진열한다.
- 카테고리 필터, 무한스크롤은 두지 않는다(YAGNI — 현재 Feature가 1개뿐).
- 카드 클릭 시 해당 Feature 상세 페이지로 이동한다(요약 모달 없음, `/templates` 패턴과 동일).
- 반응형(Desktop/Tablet/Mobile), 키보드 접근성(Tab/Enter/Space, focus outline)을 지원한다.

### 2. `/features/search` 상세 페이지

templates 상세 페이지 패턴(데모/사용기술/코드) + 이번 feature 전용 테스트 섹션으로 구성한다.

#### 2-1. 데모 섹션

- **모드 체크박스**: `실시간(Live)` / `링크이동(Navigate)` 중 하나를 선택한다(단일 선택, 라디오 성격이지만 UI는 체크박스로 표시 — 요청사항 그대로).
- **검색 대상**: 기존 StarterKit 목록(`get-starter-kits` API/mock)을 제목 기준으로 검색한다.
- **Live 모드**
  - 입력창에 타이핑하면 목록이 즉시 필터링된다.
  - 하위 옵션으로 `디바운스` / `쓰로틀링` 전략을 토글로 전환할 수 있다. 둘 다 실제로 동작한다(설명용 텍스트가 아니라 실제 필터링 타이밍 차이를 체감할 수 있어야 함).
  - 디바운스: 기존 `useDebouncedValue`(`src/shared/lib/hooks/use-debounced-value.ts`) 재사용, 300ms.
  - 쓰로틀링: 신규 `useThrottledValue` 훅을 같은 위치(`src/shared/lib/hooks/`)에 추가한다. 300ms 주기.
  - 각 전략 옆에 "왜 이렇게 동작하는지" 1~2줄 설명을 함께 노출한다.
- **Navigate 모드**
  - 입력 후 Enter(submit) 시 URL에 `?q=` 쿼리 파라미터를 추가하고 실제로 이동한다(막지 않음).
  - submit 시점에 shadcn `sonner` 토스트로 "URL이 이렇게 바뀝니다"를 안내한다(신규 설치, `npx shadcn@latest add sonner`). "이동 막기"는 실제 네비게이션 차단이 아니라, 안내 문구 맥락의 표현이다.
  - 상세 페이지 자체 URL(`/features/search`)에 `?q=` 가 반영된다.
- **모드/전략 선택 상태**는 URL에 반영하지 않는다. 로컬 state로만 관리한다. 단, Navigate 모드에서 실제 검색어(`q`)는 URL에 반영된다(그것이 Navigate 모드의 핵심 동작이므로).

#### 2-2. 사용기술 섹션

- templates 상세와 동일하게 단순 Badge 태그 나열.
- 예: React, Next.js, TypeScript, useDebouncedValue, useThrottledValue, URLSearchParams.

#### 2-3. 코드 섹션

- `StarterKitCodeViewer`(`src/features/starter-kit/ui/starter-kit-code-viewer.tsx`)를 그대로 재사용한다.
- `TemplateFile[]` 형태(`file_path` + `code` + `language` + `sort_order`)의 정적 배열로 핵심 훅/컴포넌트 소스를 구성한다(DB 없이 하드코딩).
- 최소 포함 파일: `use-debounced-value.ts`, `use-throttled-value.ts`(신규), 검색 데모 컴포넌트 본체.

#### 2-4. 테스트 섹션

- Vitest를 이번 작업 범위에서 설치/설정한다(CLAUDE.md의 "테스트: 미설치, 도입 시 이 섹션과 명령어 섹션을 갱신할 것" 항목 갱신 대상).
- `useDebouncedValue`, `useThrottledValue`에 대한 실제 Vitest 유닛 테스트 코드를 작성하고, 상세 페이지의 '테스트' 섹션에 해당 테스트 코드를 코드뷰어로 함께 보여준다.
- E2E(Playwright)는 이번 스코프에 포함하지 않는다.

---

## 경계 조건 / 에러 처리

- 검색어가 빈 문자열이면 Live 모드는 전체 목록을, Navigate 모드는 `q` 파라미터를 제거한다(`StarterKitSearchInput`의 기존 로직과 동일한 원칙).
- 검색 결과가 0건이면 "검색 결과가 없습니다" 안내를 표시한다.
- 데이터 소스(mock/API)는 기존 `get-starter-kits`를 그대로 사용하므로 별도 에러 처리를 신규로 만들지 않는다(기존 처리에 위임).

---

## 미확정 사항 (다음 단계인 PRD에서 결정)

- `/features` 목록/상세의 실제 라우트 파일 구조, 데이터 소스(Feature 테이블 유무 — 현재는 정적/mock으로 충분한지)
- Live 모드에서 디바운스/쓰로틀링 전환 UI의 구체적 컴포넌트 형태(토글 버튼 vs 라디오)
- Vitest 설치 시 설정 파일 위치, 커버리지 설정 여부, package.json 스크립트 이름
