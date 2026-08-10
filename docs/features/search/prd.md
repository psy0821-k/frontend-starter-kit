# Search Feature PRD

원본: [spec-original.md](./spec-original.md) · 확정 스펙: [spec-fixed.md](./spec-fixed.md)

---

## 개요

`/features`는 특정 페이지에 종속되지 않는 재사용 가능한 기능(Module) 모음이며, 현재 실제 콘텐츠가 없다. 이번 작업은 `/features`의 첫 번째 Feature로 **검색(Search)** 을 추가한다.

`/features` 목록 페이지는 단순 카드 그리드로 Feature를 진열하고, `/features/search` 상세 페이지는 `/templates`, `/templates/[id]` 패턴(데모/사용기술/코드)을 재사용하되 이번 Feature 전용 **테스트** 섹션을 추가한다. 상세 페이지의 핵심은 검색 UX 두 가지 방식(Live/Navigate)과, Live 모드 내 두 가지 처리 전략(Debounce/Throttle)을 실제로 동작하는 데모로 보여주는 것이다.

## 사용자 스토리

1. 방문자는 `/features`에 접속하면 등록된 Feature를 카드로 확인하고, 클릭해 상세 페이지로 이동할 수 있다.
2. 방문자는 `/features/search`에서 "실시간" 체크박스를 선택하면, 입력할 때마다 기존 스타터 킷 목록이 즉시 필터링되는 것을 확인할 수 있다.
3. 방문자는 Live 모드에서 "디바운스"/"쓰로틀링" 전략을 전환하며, 같은 입력에도 필터링 반영 타이밍이 어떻게 달라지는지 체감하고 각 전략의 설명을 읽을 수 있다.
4. 방문자는 "링크이동" 체크박스를 선택하고 검색어를 입력해 Enter를 누르면, URL이 `?q=`를 반영해 실제로 이동하며 그 전에 안내 토스트로 무엇이 일어날지 미리 안내받는다.
5. 방문자는 상세 페이지에서 이 데모를 구현한 핵심 훅/컴포넌트 코드를 파일별로 열람할 수 있다.
6. 방문자는 이 훅들을 검증하는 실제 Vitest 유닛 테스트 코드를 확인할 수 있다.
7. 방문자는 사용된 기술 스택 태그를 한눈에 확인할 수 있다.

## 구현 계획

| 영역                    | 구현 위치                                                                                | 비고                                                                    |
| ----------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Feature 목록 라우트     | `src/app/features/page.tsx`                                                              | 서버 컴포넌트, Feature 카드 그리드                                      |
| Feature 상세 라우트     | `src/app/features/search/page.tsx`                                                       | 서버 컴포넌트, `searchParams`로 초기 `q` 결정                           |
| Feature 카드 데이터     | `src/features/search-demo/model/features.ts` (신규, 정적 배열)                           | DB 없음. `{ slug: 'search', title, summary }` 형태의 하드코딩 목록      |
| 검색 데모 컨테이너      | `src/features/search-demo/ui/search-demo.tsx`                                            | 모드(Live/Navigate) 체크박스 + 전략(Debounce/Throttle) 토글 + 결과 목록 |
| 통합 rate-limit 훅      | `src/shared/lib/hooks/use-rate-limited-value.ts` (신규)                                  | `strategy: 'debounce' \| 'throttle'` 분기, 내부에서 기존/신규 훅 위임   |
| 디바운스 훅             | `src/shared/lib/hooks/use-debounced-value.ts` (기존 재사용)                              | 변경 없음                                                               |
| 쓰로틀링 훅             | `src/shared/lib/hooks/use-throttled-value.ts` (신규)                                     | 300ms 주기, 디바운스와 대칭 위치                                        |
| 검색 필터링 함수        | `src/features/starter-kit/model/filter-by-search.ts` (기존 재사용)                       | 변경 없음, `filterStarterKitsBySearch` 그대로 사용                      |
| Navigate 모드 입력      | `src/features/search-demo/ui/search-demo-navigate-input.tsx`                             | submit 시 `router.push`로 `?q=` 반영 + sonner 토스트 안내               |
| Live 모드 입력          | `src/features/search-demo/ui/search-demo-live-input.tsx`                                 | `useRateLimitedValue` 사용, 전략 설명 텍스트 동반                       |
| 검색 대상 데이터        | `src/features/starter-kit/api/get-starter-kits.ts` (기존 재사용)                         | 신규 API 없음                                                           |
| 코드 뷰어               | `src/features/starter-kit/ui/starter-kit-code-viewer.tsx` (기존 재사용)                  | `TemplateFile[]` 정적 배열을 props로 전달                               |
| 코드 뷰어용 소스 데이터 | `src/features/search-demo/model/code-samples.ts` (신규, 정적 배열)                       | 훅/컴포넌트/테스트 코드 문자열을 `TemplateFile[]`로 구성                |
| Toast 알림              | `src/components/ui/sonner.tsx` (신규 설치, shadcn CLI)                                   | `npx shadcn@latest add sonner`, `app/layout.tsx`에 `<Toaster />` 추가   |
| 테스트                  | `src/shared/lib/hooks/use-debounced-value.test.ts`, `use-throttled-value.test.ts` (신규) | Vitest, `vi.useFakeTimers()`로 타이밍 검증                              |
| 테스트 러너 설정        | `vitest.config.ts`, `package.json`(`"test"` 스크립트) (신규)                             | CLAUDE.md "테스트" 섹션 갱신 대상                                       |

## 기술 결정

### 결정 1 — Live 모드 Debounce/Throttle 전환: 단일 통합 훅 `useRateLimitedValue`

**Context** — Live 모드는 디바운스와 쓰로틀링 두 전략을 사용자가 토글로 전환하며 비교 체감할 수 있어야 한다(spec-fixed.md). 두 전략을 데모 컴포넌트에서 어떻게 조합할지 세 가지 안을 비교했다.

| #   | 기준                 | 안 A: 단일 훅 `useRateLimitedValue(strategy)`                                                                                    | 안 B: 두 훅 결과를 각각 계산 후 선택                           | 안 C: 순수 함수 조합 + 커스텀 useEffect                                             |
| --- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 1   | 데이터 구조          | `strategy` 유니온 값 하나로 분기                                                                                                 | 두 값(`debounced`, `throttled`) 동시 보유                      | 없음(콜백 기반)                                                                     |
| 2   | API 레이어 변경지점  | 없음                                                                                                                             | 없음                                                           | 없음                                                                                |
| 3   | 상태관리 변경지점    | 없음(로컬 state로 strategy만 관리)                                                                                               | 없음                                                           | 없음                                                                                |
| 4   | 핵심 동작            | 훅 내부에서 `if (strategy === 'debounce')`로 기존 훅에 위임                                                                      | 매 렌더마다 두 훅 모두 타이머를 돌리고 값만 하나 사용          | `debounce()`/`throttle()` 순수 함수를 `useEffect`+`useRef`가 직접 호출              |
| 5   | 컴포넌트 구조        | 데모 컴포넌트는 훅 하나만 호출                                                                                                   | 데모 컴포넌트가 두 훅 호출 후 삼항 선택                        | 데모 컴포넌트가 이펙트 관리 코드까지 알아야 함                                      |
| 6   | 기존 패턴과의 일관성 | `use-debounced-value.ts`와 같은 "값을 감싸 반환하는 훅" 패턴 유지, 시그니처만 확장                                               | 기존 패턴 유지하지만 안 쓰는 쪽 훅도 항상 실행됨               | 기존 훅 스타일과 다른 새 스타일 도입                                                |
| 7   | 테스트 용이성        | 훅 하나에 `strategy` 매개변수를 바꿔가며 테스트, 기존 `useDebouncedValue`/신규 `useThrottledValue` 테스트는 각자 독립적으로 유지 | 두 훅 각각 테스트는 쉬우나 "선택 로직"에 대한 별도 테스트 필요 | 순수 함수 자체는 테스트하기 쉬우나 훅 통합 테스트가 까다로움(fake timer + ref 상태) |

**Decision** — 안 A. `src/shared/lib/hooks/use-rate-limited-value.ts`를 신규 추가하고, 내부에서 `strategy`에 따라 기존 `useDebouncedValue`(변경 없음)와 신규 `useThrottledValue`(같은 위치에 신규 추가) 중 하나를 호출해 위임한다. 데모 컴포넌트는 `useRateLimitedValue(query, 300, strategy)` 하나만 사용한다.

**Alternatives**

- 안 B(두 훅 동시 계산 후 선택): 안 쓰는 전략의 타이머까지 매번 돌아 불필요한 리렌더링·클린업이 발생하고, "어느 훅이 실제로 쓰이는지"가 호출부에서 한눈에 안 보여 가독성이 떨어진다. 기각.
- 안 C(순수 함수 + 커스텀 useEffect): 가장 유연하지만 이번 스코프(하나의 데모 페이지에서 두 전략을 보여주는 것)에 비해 구현 복잡도가 과하다(YAGNI). 기존 `use-debounced-value.ts`가 이미 검증된 훅 패턴을 갖고 있는데 이를 버리고 새 스타일을 도입할 이유가 없다. 기각.

**Consequences**

- 장점: 기존 `useDebouncedValue`를 전혀 수정하지 않고 그대로 재사용하며, `useThrottledValue`도 동일한 시그니처(`(value, delay) => T`)로 만들어 두 훅이 서로 대칭을 이룬다. 데모 컴포넌트와 테스트 모두 단순해진다.
- 단점: `useRateLimitedValue`가 두 훅을 감싸는 한 단계 레이어가 추가되어, 이 조합 훅 자체가 실제로 다른 곳에서 재사용되지 않으면(2회 규칙 미충족 시) `shared/lib/hooks/`에 남겨두는 게 맞는지 추후 재검토 대상이 된다.

### 결정 2 — 코드 섹션 데이터: `TemplateFile[]` 정적 배열 + 기존 `StarterKitCodeViewer` 재사용

**Context** — templates 상세 페이지의 코드 섹션은 DB에서 조회한 `TemplateFile[]`을 `StarterKitCodeViewer`로 렌더링한다. Search Feature는 DB 테이블이 없고 코드가 소스 파일 자체에 존재하므로, 코드 문자열을 어떻게 코드 뷰어에 공급할지 결정이 필요했다.

| #   | 기준                 | 안 A: 정적 `TemplateFile[]` 하드코딩                                                                                    | 안 B: 신규 `features`/`feature_files` 테이블 도입                                                                        | 안 C: 코드 뷰어 없이 GitHub 링크만 제공      |
| --- | -------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| 1   | 데이터 구조          | 소스 문자열을 `{ file_path, code, language, sort_order }[]`로 그대로 배열 리터럴에 작성                                 | DB 스키마 신설, 마이그레이션 필요                                                                                        | 링크 문자열만                                |
| 2   | API 레이어 변경지점  | 없음                                                                                                                    | `get-feature-by-id.ts` 신규 API 필요                                                                                     | 없음                                         |
| 3   | 상태관리 변경지점    | 없음                                                                                                                    | 없음                                                                                                                     | 없음                                         |
| 4   | 핵심 동작            | import한 정적 배열을 props로 전달                                                                                       | 서버에서 조회 후 전달                                                                                                    | 외부 링크로 위임, 사이트 내 코드 열람 불가   |
| 5   | 컴포넌트 구조        | `StarterKitCodeViewer` 그대로 재사용                                                                                    | `StarterKitCodeViewer` 재사용 가능하나 DB 조회 계층 추가                                                                 | 코드 뷰어 자체 불필요                        |
| 6   | 기존 패턴과의 일관성 | `starter-kit/CLAUDE.md`가 예고한 "코드 뷰어는 Feature에서도 재사용 가능"과 정확히 일치, `TemplateFile` 타입도 이미 존재 | 같은 CLAUDE.md가 예고한 "Feature는 별도 테이블"과 일치하지만, 지금 도입하면 실제 데이터 없이 스키마만 신설하는 선제 구현 | 데모 목적("코드를 보여준다")에 부합하지 않음 |
| 7   | 테스트 용이성        | 정적 데이터라 테스트에 영향 없음                                                                                        | DB 목업/시딩 필요, 테스트 복잡도 증가                                                                                    | 해당 없음                                    |

**Decision** — 안 A. `src/features/search-demo/model/code-samples.ts`에 `TemplateFile[]` 형태의 정적 배열을 작성하고(실제 훅/컴포넌트/테스트 파일 내용을 문자열로 담음), 기존 `StarterKitCodeViewer`를 그대로 재사용한다.

**Alternatives**

- 안 B(신규 테이블): `starter-kit/CLAUDE.md`가 이미 "Feature는 Template과 별도 테이블(`features`/`feature_files`)로 갈 예정"이라 명시하지만, 이는 Feature가 여러 개로 늘어나고 관리자가 직접 등록/수정하는 시나리오가 실제로 필요할 때의 방향이다. 지금은 Feature가 1개뿐이고 관리자 CRUD 요구도 없어(spec-fixed.md Out of Scope 후보) 테이블 신설은 추측 기반 선제 구현(YAGNI 위반)이다. 기각하되, Feature가 2개 이상으로 늘어나는 시점에 재검토한다.
- 안 C(GitHub 링크): "코드" 섹션을 요구한 spec-fixed.md 취지(사이트 내에서 코드를 직접 보여준다)에 맞지 않는다. 기각.

**Consequences**

- 장점: 신규 마이그레이션 없이 이번 스코프를 완결할 수 있고, `TemplateFile` 타입과 `StarterKitCodeViewer` 컴포넌트를 100% 그대로 재사용해 새 UI 코드가 필요 없다.
- 단점: 코드 샘플이 실제 소스 파일과 별개의 문자열 사본이라, 원본 훅 코드가 바뀌면 `code-samples.ts`를 수동으로 동기화해야 한다(자동 동기화 메커니즘 없음). Feature가 여러 개로 늘어나 관리자가 직접 등록해야 하는 시점에는 안 B로 전환이 필요하다.

## Out of Scope

- `features`/`feature_files` DB 테이블 및 관리자 CRUD — Feature가 1개뿐인 현재 스코프에서는 정적 데이터로 충분(결정 2 참고). Feature가 2개 이상으로 늘어나면 재검토.
- `/features` 목록 페이지의 카테고리 필터·무한스크롤 — 데이터 1건에는 과잉(spec-fixed.md 확정 사항).
- Live/Navigate 모드 선택 및 Debounce/Throttle 전략 선택 상태의 URL 반영 — 로컬 state로만 관리(spec-fixed.md 확정 사항). Navigate 모드의 실제 검색어(`q`)만 URL에 반영.
- Navigate 모드의 실제 네비게이션 차단(confirm 다이얼로그 등) — "이동 막기"는 안내 문구 맥락이며 실제 이동은 항상 진행.
- 검색 대상 확장(요약 summary, 기술 스택 tech_stack 등) — `filterStarterKitsBySearch` 기존 로직(제목·태그)을 그대로 사용, 신규 검색 로직 없음.
- E2E(Playwright) 테스트 — 이번 스코프는 Vitest 유닛 테스트(`useDebouncedValue`, `useThrottledValue`)로 한정.
- `code-samples.ts`와 실제 소스 파일 간 자동 동기화(빌드 타임 코드 추출 등) — 수동 동기화로 충분한 규모(결정 2 Consequences 참고).
- 쓰로틀링 전략을 위한 별도 UI 라이브러리 도입 — `useThrottledValue`는 프로젝트 내부에서 직접 구현.

## 용어 정의

spec-fixed.md의 용어 정의를 그대로 따른다. 추가되는 용어:

| 용어                  | 정의                                                                                                                                                              |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useRateLimitedValue` | `strategy`(`'debounce'` \| `'throttle'`)에 따라 `useDebouncedValue` 또는 `useThrottledValue`에 위임하는 통합 훅(`src/shared/lib/hooks/use-rate-limited-value.ts`) |
| `useThrottledValue`   | 입력 중에도 일정 주기(300ms)마다 최신 값을 반영하는 신규 훅(`src/shared/lib/hooks/use-throttled-value.ts`)                                                        |
| `code-samples.ts`     | Search Feature의 코드 섹션에 표시할 `TemplateFile[]` 정적 배열(`src/features/search-demo/model/code-samples.ts`)                                                  |

## 관련 문서

- [spec-original.md](./spec-original.md) — 초기 아이디어
- [spec-fixed.md](./spec-fixed.md) — 확정 요구사항, 용어 정의
- [../templates/prd.md](../../templates/prd.md) — 참고 패턴(목록/상세 구조, 검색 상태관리 ADR)
