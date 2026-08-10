# Search Feature 이슈 분해

PRD([prd.md](./prd.md)) 기준. 수직 슬라이스 5개로 나눈다. 이슈 1(Vitest 도입 + rate-limit 훅)이
나머지 모든 이슈의 기반이므로 반드시 먼저 진행한다. 이슈 2(목록)는 이슈 3~~5(상세)보다 먼저
진행해 `/features` 라우트 자체가 먼저 존재하게 한다. 이슈 3~~5는 서로 다른 화면 영역(Live 데모 /
Navigate 데모 / 사용기술·코드)이라 병렬 진행 가능하다.

---

## 이슈 1 — Vitest 도입 + `useThrottledValue`/`useRateLimitedValue` 훅

### 설명

프로젝트에 Vitest가 아직 설치되어 있지 않다(CLAUDE.md "테스트: 미설치"). 이번 Feature의 핵심인
디바운스/쓰로틀링 비교 데모를 만들기 전에, 두 전략을 실제로 검증하는 신규 훅과 테스트 환경부터
갖춘다. `useDebouncedValue`는 기존 그대로 재사용하고, 대칭 위치에 `useThrottledValue`를 추가한
뒤, 둘을 하나의 인터페이스로 묶는 `useRateLimitedValue`를 추가한다(PRD 결정 1).

### 변경 지점

- `package.json` — `vitest`, `@testing-library/react`, `jsdom` 등 devDependency 추가, `"test"` 스크립트 추가
- `vitest.config.ts` — 신규, jsdom 환경 설정
- `src/shared/lib/hooks/use-throttled-value.ts` — 신규. 입력 중에도 300ms 주기로 값을 갱신하는 훅
- `src/shared/lib/hooks/use-throttled-value.test.ts` — 신규. `vi.useFakeTimers()`로 주기적 갱신 검증
- `src/shared/lib/hooks/use-debounced-value.test.ts` — 신규. 기존 훅에 대한 회귀 테스트(입력 멈춘 뒤에만 갱신)
- `src/shared/lib/hooks/use-rate-limited-value.ts` — 신규. `strategy`에 따라 두 훅에 위임
- `src/shared/lib/hooks/use-rate-limited-value.test.ts` — 신규. 두 strategy 분기 모두 검증
- `CLAUDE.md` — "테스트" 표·명령어 표 갱신(Vitest 설치 완료 반영)

### Acceptance Criteria

- [ ] Given `npm run test`를 실행했을 때, When 테스트가 끝나면, Then `use-debounced-value`, `use-throttled-value`, `use-rate-limited-value` 세 스펙이 모두 통과한다.
- [ ] Given `useThrottledValue(value, 300)`에 짧은 간격으로 여러 번 값이 바뀌는 상황을 fake timer로 재현했을 때, When 300ms가 경과하면, Then 마지막 값이 아니라 "주기마다의 스냅샷" 값으로 갱신된다(디바운스와 달리 입력 도중에도 최소 한 번 이상 갱신됨을 테스트로 구분).
- [ ] Given `useRateLimitedValue(value, 300, 'debounce')`를 호출했을 때, When 값이 변경되면, Then `useDebouncedValue`와 동일한 타이밍에 갱신된다.
- [ ] Given `useRateLimitedValue(value, 300, 'throttle')`를 호출했을 때, When 값이 변경되면, Then `useThrottledValue`와 동일한 타이밍에 갱신된다.

### 의존성

없음 — 선행 이슈. 이슈 3(Live 데모)이 이 훅들에 의존한다.

---

## 이슈 2 — `/features` 목록 페이지

### 설명

`/features`에 등록된 Feature를 카드 그리드로 진열하는 목록 페이지를 만든다. 현재 Feature는
search 1건뿐이라 카테고리 필터·무한스크롤 없이 단순 그리드로 충분하다(PRD Out of Scope). 카드
클릭 시 `/features/search`로 이동한다.

### 변경 지점

- `src/app/features/page.tsx` — 신규 서버 컴포넌트, Feature 카드 그리드
- `src/features/search-demo/model/features.ts` — 신규. `{ slug: 'search', title, summary }` 형태의 정적 Feature 목록(현재 1건)
- `src/features/search-demo/ui/feature-card.tsx` — 신규. templates의 `starter-kit-card.tsx` 패턴을 참고한 카드 UI(썸네일 없이 제목/요약만)

### Acceptance Criteria

- [ ] Given 등록된 Feature가 존재할 때, When 사용자가 `/features`에 접속하면, Then Feature 카드(search)가 표시된다.
- [ ] Given 목록이 표시되고 있을 때, When 사용자가 카드를 클릭(또는 Tab+Enter/Space)하면, Then `/features/search` 상세 페이지로 이동한다.
- [ ] Given 카드가 표시되고 있을 때, When 키보드로 Tab 이동하면, Then 포커스 outline이 보이고 Enter/Space로 선택 가능하다.

### 의존성

없음 — 이슈 3~~5(상세 페이지 콘텐츠)보다 먼저 진행해 라우트 골격을 먼저 만든다. 이슈 3의
상세 페이지가 아직 없어도 이 이슈 자체는 placeholder 상세 페이지로 완결 가능(카드 클릭 시 404
대신 최소한의 상세 페이지 셸이 있어야 하므로, `src/app/features/search/page.tsx` 파일 생성까지는
이 이슈에 포함하고 내용 채우기는 이슈 3~~5에서 이어간다).

---

## 이슈 3 — `/features/search` 상세 — Live 모드 데모(Debounce/Throttle 토글)

### 설명

상세 페이지의 핵심 데모. "실시간" 체크박스를 선택하면 입력에 따라 기존 스타터 킷 목록이
즉시 필터링되고, 하위 토글로 디바운스/쓰로틀링 전략을 전환하며 필터링 반영 타이밍 차이를
체감할 수 있다. 각 전략 옆에 짧은 설명을 함께 노출한다(PRD 사용자 스토리 2, 3).

### 변경 지점

- `src/app/features/search/page.tsx` — 이슈 2에서 만든 셸에 데모 섹션 연결, `searchParams`로 초기 `q` 결정(Navigate 모드용, 이슈 4와 공유)
- `src/features/search-demo/ui/search-demo.tsx` — 신규. 모드(Live/Navigate) 체크박스 컨테이너
- `src/features/search-demo/ui/search-demo-live-input.tsx` — 신규. `useRateLimitedValue` 사용, 전략 토글 + 설명 텍스트
- `src/features/starter-kit/model/filter-by-search.ts` — 기존 재사용(변경 없음), `filterStarterKitsBySearch`로 결과 목록 필터링
- `src/features/starter-kit/api/get-starter-kits.ts` — 기존 재사용(변경 없음), 검색 대상 데이터 소스

### Acceptance Criteria

- [ ] Given "실시간" 모드가 선택된 상태에서, When 검색창에 스타터 킷 제목 일부를 입력하면, Then 목록이 일치하는 항목으로 필터링된다.
- [ ] Given Live 모드에서 "디바운스" 전략이 선택된 상태일 때, When 짧은 간격으로 연속 타이핑하면, Then 입력이 멈춘 뒤에만 목록이 갱신된다.
- [ ] Given Live 모드에서 "쓰로틀링" 전략이 선택된 상태일 때, When 짧은 간격으로 연속 타이핑하면, Then 입력 도중에도 일정 주기(300ms)마다 목록이 갱신된다.
- [ ] Given 전략 토글이 표시되고 있을 때, When 화면을 보면, Then 각 전략에 대한 1~2줄 설명 텍스트가 함께 보인다.
- [ ] Given 검색어를 지웠을 때, When 입력창이 빈 문자열이 되면, Then 전체 스타터 킷 목록이 다시 표시된다.
- [ ] Given 검색 결과가 0건일 때, When 화면을 보면, Then "검색 결과가 없습니다" 안내가 표시된다.

### 의존성

이슈 1(`useRateLimitedValue`, `useThrottledValue`) — 이 훅들 없이는 전략 토글 자체가 동작하지 않는다. 이슈 2(라우트 셸) — `src/app/features/search/page.tsx` 파일이 먼저 존재해야 한다.

---

## 이슈 4 — `/features/search` 상세 — Navigate 모드 데모(URL 반영 + 안내 토스트)

### 설명

"링크이동" 체크박스를 선택하고 검색어를 입력해 Enter(submit)하면 URL에 `?q=`를 반영하고
실제로 이동한다. submit 시점에 sonner 토스트로 "URL이 이렇게 바뀝니다"를 안내한다(PRD
사용자 스토리 4).

### 변경 지점

- `src/components/ui/sonner.tsx` — 신규 설치(`npx shadcn@latest add sonner`)
- `src/app/layout.tsx` — `<Toaster />` 추가
- `src/features/search-demo/ui/search-demo-navigate-input.tsx` — 신규. submit 시 `router.push`로 `?q=` 반영 + 토스트 호출
- `src/features/search-demo/ui/search-demo.tsx` — Live/Navigate 모드 전환 시 Navigate 입력 컴포넌트 렌더링 분기 추가(이슈 3에서 만든 컨테이너에 이어붙임)

### Acceptance Criteria

- [ ] Given "링크이동" 모드가 선택된 상태에서, When 검색어를 입력하고 Enter를 누르면, Then URL에 `?q=`가 반영되고 페이지가 갱신된다.
- [ ] Given submit이 일어난 직후, When 화면을 보면, Then "URL이 `?q=...`로 바뀝니다" 형태의 안내 토스트가 표시된다.
- [ ] Given `?q=` 파라미터가 있는 상태로 `/features/search`에 새로고침 접속했을 때, When 화면을 보면, Then 해당 검색어로 필터링된 결과가 초기 렌더링부터 반영되어 있다.
- [ ] Given Navigate 모드에서 검색어를 빈 문자열로 지우고 submit했을 때, When URL을 보면, Then `q` 파라미터가 제거된다.

### 의존성

이슈 2(라우트 셸), 이슈 3(`search-demo.tsx` 컨테이너와 모드 체크박스) — 같은 컨테이너에
이어붙이는 구조라 이슈 3의 모드 전환 UI가 먼저 있어야 한다.

---

## 이슈 5 — `/features/search` 상세 — 사용기술·코드·테스트 섹션

### 설명

상세 페이지의 나머지 섹션(templates 상세 패턴과 동일한 사용기술 태그 + 코드 뷰어, 이번
Feature 전용 테스트 코드 노출)을 완성한다(PRD 사용자 스토리 5, 6, 7).

### 변경 지점

- `src/features/search-demo/model/code-samples.ts` — 신규. `use-debounced-value.ts`, `use-throttled-value.ts`, `use-rate-limited-value.ts`, `search-demo-live-input.tsx`, `search-demo-navigate-input.tsx`, 및 이슈 1의 테스트 파일들을 `TemplateFile[]` 형태로 담은 정적 배열
- `src/app/features/search/page.tsx` — `StarterKitCodeViewer`(기존 재사용)에 `code-samples.ts` 전달, 사용기술 Badge 섹션 추가

### Acceptance Criteria

- [ ] Given 상세 페이지에 접속했을 때, When "사용기술" 섹션을 보면, Then React, Next.js, TypeScript, useDebouncedValue, useThrottledValue, URLSearchParams 등의 태그가 Badge로 표시된다.
- [ ] Given 상세 페이지에 접속했을 때, When "코드" 섹션을 보면, Then 핵심 훅/컴포넌트 파일들이 파일별 탭으로 구분되어 표시되고, 탭을 전환하면 해당 파일 코드가 보인다.
- [ ] Given "코드" 섹션에서, When 파일 탭 목록을 보면, Then `use-debounced-value.test.ts`, `use-throttled-value.test.ts` 등 이슈 1에서 작성한 실제 Vitest 테스트 코드도 파일 목록에 포함되어 있다.

### 의존성

이슈 1(테스트 코드 원본), 이슈 3(`search-demo-live-input.tsx` 원본), 이슈 4(`search-demo-navigate-input.tsx` 원본) — `code-samples.ts`가 이 파일들의 실제 코드를 문자열로 담으므로, 원본 파일들이 먼저 작성되어 있어야 한다.
