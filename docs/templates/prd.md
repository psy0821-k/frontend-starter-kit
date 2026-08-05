# Templates 목록 페이지 PRD

**상태**: 목록·필터·검색·무한스크롤 구현 완료(이슈 01~03 + 검색 기능 추가 반영). 본 문서는 요구사항·기술 결정을 하나로 통합해 이후 이슈 분해의 기준이 되는 단일 문서다.

원본: [spec.md](./spec.md) · 확정 스펙: [spec-fixed.md](./spec-fixed.md) · 디자인 노트: [design.md](./design.md)

---

## 개요

`/templates`는 등록된 모든 스타터 킷을 카테고리 구분 없이(또는 필터 적용 시 해당 카테고리만) 탐색하는 전용 페이지다. 랜딩페이지(`/`)가 카테고리별 하이라이트(최대 6개)만 보여주는 것과 달리, 이 페이지는 카테고리 필터(단일 선택), 실시간 검색(제목/태그, 300ms 디바운스), 클라이언트 측 무한스크롤(9개 단위)을 갖춰 전체 스타터 킷을 끝까지 탐색할 수 있게 한다. 카드 클릭 시 요약 모달 없이 바로 상세 페이지(`/templates/[id]`, 현재 placeholder)로 이동한다.

## 사용자 스토리

1. 방문자는 `/templates`에 접속하면 카테고리 구분 없이 전체 스타터 킷 목록을 최신순으로 확인할 수 있다.
2. 방문자는 카테고리 칩을 선택해 원하는 카테고리의 스타터 킷만 골라볼 수 있다.
3. 방문자는 검색창에 제목이나 태그의 일부를 입력해 실시간으로(입력을 멈추고 잠시 후) 일치하는 스타터 킷만 골라볼 수 있다.
4. 방문자는 카테고리 필터와 검색어를 동시에 적용해 두 조건을 모두 만족하는 스타터 킷만 좁혀볼 수 있다.
5. 방문자는 목록 하단까지 스크롤하면 별도 클릭 없이 다음 9개 항목을 이어서 볼 수 있다.
6. 방문자는 카드를 클릭(또는 Tab+Enter/Space)하면 바로 해당 스타터 킷의 상세 페이지로 이동한다.
7. 방문자가 선택한 조건(카테고리·검색어)에 맞는 스타터 킷이 없으면 필터 전용 안내 메시지를 보고, 전체가 0개면 전역 빈 상태 UI를 본다.
8. 스크린리더 사용자는 필터·검색 변경과 무한스크롤 로딩 상태를 실시간 음성 안내로 인지할 수 있다.

## 구현 계획

| 영역                 | 구현 위치                                                          | 비고                                                                                     |
| -------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| 라우트               | `src/app/templates/page.tsx`                                       | 서버 컴포넌트, `getStarterKits()` 재사용, `searchParams`로 초기 카테고리·검색어 결정     |
| 카테고리 필터        | `src/features/starter-kit/ui/starter-kit-category-filter.tsx`      | 클라이언트, URL 쿼리스트링(`?category=`) 갱신 전담                                       |
| 검색 입력            | `src/features/starter-kit/ui/starter-kit-search-input.tsx`         | 클라이언트, 로컬 입력 상태 + 300ms 디바운스 후 URL 쿼리스트링(`?q=`) 갱신                |
| 디바운스 훅          | `src/shared/lib/hooks/use-debounced-value.ts`                      | 도메인 비의존적 범용 훅이라 처음부터 `shared/lib/hooks/`에 배치                          |
| 검색 필터링 함수     | `src/features/starter-kit/model/filter-by-search.ts`               | 제목/태그 대소문자 무시 부분 일치, `filter-by-category.ts`와 대칭 위치                   |
| 전체 목록 컨테이너   | `src/features/starter-kit/ui/starter-kit-infinite-list.tsx`        | 클라이언트, 카테고리+검색 필터링(AND)+노출개수+무한스크롤+빈 상태 분기                   |
| 필터 전용 빈 상태    | `src/features/starter-kit/ui/starter-kit-filtered-empty-state.tsx` | 기존 `starter-kit-empty-state.tsx`(전역용)와 문구 구분, 카테고리·검색 공용 문구로 일반화 |
| 무한스크롤 훅        | `src/features/starter-kit/lib/use-infinite-scroll.ts`              | IntersectionObserver 래핑, 범용 콜백 훅                                                  |
| 카테고리 필터링 함수 | `src/features/starter-kit/model/filter-by-category.ts`             | `group-by-category.ts`와 대칭 위치의 순수 함수                                           |
| 카드 UI              | `src/features/starter-kit/ui/starter-kit-card.tsx` (기존 재사용)   | `onSelect` 콜백만 라우팅으로 교체, 컴포넌트 자체는 수정 없음                             |
| 검색 입력 UI 원본    | `src/components/ui/input.tsx` (신규 설치)                          | shadcn CLI로 추가한 원본, 직접 수정하지 않고 그대로 사용                                 |
| 데이터 소스          | `src/features/starter-kit/api/get-starter-kits.ts` (기존 재사용)   | 신규 서버 페이지네이션/검색 API 없음                                                     |
| 상세 페이지          | `src/app/templates/[id]/page.tsx` (기존, placeholder 유지)         | `<h1 tabIndex={-1}>` + 마운트 포커스 이동만 이번 스코프에서 추가                         |

## 기술 결정

### 카테고리 필터 상태관리 — URL 쿼리스트링 vs Zustand

**Context** — 카테고리 필터는 새로고침·직접 URL 접근·뒤로가기에도 유지되어야 하며(spec-fixed.md), 프로젝트 원칙상 서버/브라우저가 이미 소유한 상태를 별도 클라이언트 스토어로 복제하지 않아야 한다.

**Decision** — Next.js App Router 표준 패턴을 사용한다. `page.tsx`(서버)는 `searchParams: Promise<{ category?: string }>`로 초기 필터값을 받아 SSR 시점에 정확한 상태를 렌더링하고, `starter-kit-category-filter.tsx`(클라이언트)는 `useRouter().push` + `useSearchParams()`로 `?category=Frontend`를 갱신한다(`scroll: false`로 필터 변경 시 스크롤 점프 방지). 필터 값 타입은 `StarterKitCategory | 'all'` 유니온으로 제한하고, `useSearchParams()`가 반환하는 `string | null`은 타입 가드 함수 하나로 검증해 허용되지 않는 값은 `'all'`로 폴백한다.

**Alternatives**

- Zustand로 필터 상태 관리: CLAUDE.md 원칙상 Zustand는 서버 상태를 담지 않는데, URL도 같은 맥락에서 브라우저(주소창)가 이미 소유한 상태다. 별도 스토어에 복제하면 새로고침 시 스토어 초기화 vs URL 값 유지처럼 두 상태가 어긋날 위험만 생긴다.
- 클라이언트 로컬 `useState`만 사용: 새로고침·URL 공유 시 필터가 초기화되어 spec-fixed.md의 "새로고침·뒤로가기 시에도 유지" 요구를 충족하지 못한다.

**Consequences** — 장점: 상태 소스가 하나(URL)로 고정되어 동기화 버그가 구조적으로 발생하지 않고, 필터가 걸린 URL을 그대로 공유·북마크할 수 있다. 단점: 필터 변경마다 라우터 네비게이션이 발생해 클라이언트 상태 변경보다 약간의 오버헤드가 있다(이 페이지 규모에서는 체감 차이 없음).

### 무한스크롤 구현 경계 — 서버 fetch 1회 + 클라이언트 점진 노출

**Context** — mock 데이터는 클라이언트 메모리에 전체 배열로 존재하며, 이번 스코프에서 서버 페이지네이션 API를 신설하지 않기로 확정했다(spec-fixed.md, YAGNI).

**Decision** — 전체 데이터는 서버 컴포넌트(`page.tsx`)에서 `getStarterKits()`로 한 번만 가져오고, 카테고리 필터링과 노출 개수(9개 단위) 제어는 클라이언트 컴포넌트(`starter-kit-infinite-list.tsx`)에서 처리한다. `IntersectionObserver` 관찰 자체는 `use-infinite-scroll.ts`라는 범용 훅으로 분리해 "무엇을 몇 개씩 늘릴지"는 모르게 하고, sentinel 교차 시 콜백만 호출하게 한다. "9개씩 늘리기"·"필터 변경 시 노출 개수 리셋" 로직은 훅 밖에 둔다.

**Alternatives**

- 서버 페이지네이션(`getStarterKits({ page, limit })`) 도입: Supabase 전환 시 자연스럽게 맞물리지만, 현재 mock 데이터 단계에서는 추가 네트워크 왕복 없이 전량을 한 번에 넘기는 것으로 충분해 과설계(YAGNI 위반)로 판단. Supabase 연동 시점에 재검토.
- `use-infinite-scroll.ts`에 "9개 단위 증가" 로직까지 포함: 훅이 "언제 더 로드할지"와 "몇 개씩 로드할지"를 모두 알게 되면 다른 도메인에서 재사용할 때(예: 다른 페이지 크기가 필요할 때) 훅 자체를 수정해야 한다. 관찰과 정책을 분리해 관심사를 나눴다.

**Consequences** — 장점: 신규 API 없이 기존 `getStarterKits()`를 그대로 재사용, 무한스크롤 훅은 도메인 비의존적이라 2회 규칙 충족 시 `shared/lib/`로 승격하기 쉽다. 단점: 스타터 킷 전체 수가 매우 커지면(현재 mock 규모에서는 해당 없음) 초기 페이로드가 함께 커진다 — Supabase 연동 시 서버 페이지네이션으로 전환이 필요하다.

### 검색 상태관리 — 로컬 상태(즉시) + URL 반영(디바운스)

**Context** — 검색은 "타이핑할 때마다 반응해야 한다"는 실시간성과 "새로고침·공유 시에도 유지되어야 한다"는 URL 상태 요구가 동시에 있다. 카테고리 필터처럼 클릭 즉시 URL을 갱신하면, 키 입력마다 라우터 네비게이션이 발생해 불필요한 리렌더링과 히스토리 오염(입력 중간값들이 모두 뒤로가기 스택에 쌓임)이 생긴다.

**Decision** — 입력 필드는 컴포넌트 로컬 `useState`로 즉시 반영해 타이핑 지연이 없게 하고, `useDebouncedValue`(300ms) 훅을 거친 값만 `useEffect`에서 `router.replace()`로 URL(`?q=`)에 반영한다. `push` 대신 `replace`를 사용해 디바운스된 검색어 변경들이 브라우저 히스토리에 쌓이지 않도록 한다(카테고리 필터는 명시적 선택 액션이라 `push`가 자연스럽지만, 검색은 타이핑 과정의 중간 상태이므로 `replace`가 맞다).

**Alternatives**

- 카테고리 필터와 동일하게 즉시 `push`: 키 입력마다 URL이 바뀌고 히스토리 스택에 쌓여, 사용자가 뒤로가기를 여러 번 눌러야 검색 이전 화면으로 돌아가는 문제가 생긴다.
- 디바운스 없이 로컬 상태만으로 필터링하고 URL에는 반영하지 않음: 타이핑 반응성은 좋지만 새로고침·URL 공유 시 검색어가 사라져 spec-fixed.md의 "새로고침·URL 공유 시에도 유지" 요구를 충족하지 못한다.
- 서버 API 레벨에서 검색(예: `getStarterKits({ q })`): mock 데이터가 이미 전량 클라이언트에 있는 상태이므로 카테고리 필터와 동일한 이유(YAGNI)로 클라이언트 필터링을 선택했다.

**Consequences** — 장점: 타이핑 반응성과 URL 상태 지속성을 모두 확보하면서 히스토리 오염을 피한다. 단점: 로컬 상태와 URL 상태가 300ms 동안 일시적으로 어긋나는 구간이 존재한다(의도된 트레이드오프이며, 이 구간의 값은 항상 로컬 상태가 우선하므로 사용자에게 혼란을 주지 않는다).

### 카테고리 필터 UI의 접근성 시맨틱 — 버튼 그룹 + `aria-pressed`

**Context** — 단일 선택 카테고리 필터를 스크린리더 사용자에게 명확한 상태로 전달해야 하며, spec-fixed.md는 Tab/Enter/Space 조작만 요구하고 화살표 키 이동은 요구하지 않는다.

**Decision** — `<div role="group" aria-label="카테고리 필터">` 안에 `<button type="button" aria-pressed={isSelected}>` 칩을 배치한다. 시각적으로는 선택 칩에 배경 채움(solid)을, 비선택 칩에 outline을 적용해 색상 대비뿐 아니라 형태 차이로도 상태를 구분한다(accessibility.md의 "색상만으로 상태 표현 금지" 충족).

**Alternatives**

- `role="radiogroup"` + `role="radio"`(`aria-checked`): 스크린리더가 "N개 중 1개, 선택됨"을 정확히 안내하지만, 네이티브 라디오처럼 방향키(←/→) 이동을 별도 구현해야 한다. spec-fixed.md가 요구하지 않는 키보드 동작이라, 구현하지 않은 채 radio 시맨틱만 쓰면 스크린리더 사용자가 방향키를 기대했다가 혼란을 겪는 "깨진 위젯"이 된다.
- `<nav>` + `aria-current="true"`: `aria-current`는 "현재 페이지/단계"처럼 내비게이션 맥락에 적합하나, 필터는 페이지 이동이 아니라 목록 상태를 토글하는 액션이라 의미가 어긋난다.

**Consequences** — 장점: 버튼 네이티브 동작만으로 Tab 이동·Enter/Space 선택이 해결되어 추가 키보드 핸들러가 불필요하고, `aria-pressed` 값과 시각 상태(배경 채움)를 한 컴포넌트에서 함께 관리하므로 동기화 버그 위험이 낮다. 단점: `aria-pressed`만으로는 "그룹 내 단일 선택"이라는 의미까지 전달하지 못해 `role="group"` + `aria-label`로 보완이 필요하다 — 만약 향후 다중 선택 필터로 확장된다면 이 시맨틱 결정을 재검토해야 한다.

## 디자인 규칙 적용

[docs/design/](../design/index.md) 공통 가이드를 templates에 적용한 값이다. 상세 근거는 [design.md](./design.md) 참조.

```yaml
page:
  purpose: 등록된 모든 스타터 킷을 필터링·무한스크롤로 탐색
  target_user: 스타터 킷을 비교·탐색 중인 개발자
  industry: Data(밀도) + Emotion(썸네일 중심) 중간 — 4분류 중 단일 유형에 정확히 속하지 않음
  design_style: Minimalism
  layout_pattern: Bento Grid (균일 그리드형)
  color_direction: Content/Data 방향 절충 — 뉴트럴 비중 높게, 상태(선택 필터) 표현은 색+형태 병행
  theme: light # 기본 노출, 다크도 항상 동등 지원
  motion_level: button-only # 칩 토글·카드 hover에 한정, 무한스크롤 자체는 모션 없음
```

### 디자인 규칙 대비 검증 계획

랜딩페이지(issues.md #1~#4)와 동일한 방식으로, 구현 이슈 단계에서 아래 항목을 실측·기록한다. 이번 PRD 시점에는 값을 확정하지 않고 검증 대상만 명시한다.

| 규칙                                           | 기준                             | 검증 대상                                                                         |
| ---------------------------------------------- | -------------------------------- | --------------------------------------------------------------------------------- |
| [accessibility.md](../design/accessibility.md) | 본문 대비 4.5:1 이상             | 선택/비선택 필터 칩의 텍스트-배경 대비(라이트/다크 각각)                          |
| [accessibility.md](../design/accessibility.md) | 색상만으로 상태 표현 금지        | 선택 칩의 배경 채움 형태 차이가 실제로 시각 구분되는지                            |
| [accessibility.md](../design/accessibility.md) | Keyboard Navigation, Focus State | 필터 칩 Tab 이동, 카드 Tab 이동, sentinel이 Tab 순서에 끼지 않는지                |
| [layout.md](../design/layout.md)               | Bento Grid 반응형                | 모바일 1열/태블릿 2열/데스크톱 3열 그리드 실측                                    |
| [visual-style.md](../design/visual-style.md)   | Motion Duration 표 준수          | 필터 토글·카드 hover가 120ms/200ms 기준을 따르는지, `prefers-reduced-motion` 대응 |

## Out of Scope

- `/templates/[id]` 상세 페이지 실제 콘텐츠 구현 — placeholder 유지, 이번 스코프는 `<h1 tabIndex={-1}>` + 마운트 포커스 이동만 추가
- Supabase 실제 연동 — mock 데이터의 필드 스키마만 대비, 실 연동은 후속 스코프
- 서버 사이드 페이지네이션·검색 API — 클라이언트 측 무한스크롤·필터링으로 대체(위 ADR 참고)
- 검색 대상 확장(요약 summary, 기술 스택 tech_stack 등) — 이번 스코프는 제목·태그로 한정
- 검색어 하이라이트(일치 부분 강조 표시) — 결과 필터링만 제공
- 유료/무료 구분 태그·필터 — 과금 정책 미확정, 확정 시 별도 feature로 인터뷰부터 재시작
- 다중 선택 카테고리 필터 — spec-fixed.md에서 단일 선택으로 확정
- 랜딩페이지(`/`)의 카테고리별 하이라이트 섹션 변경 — 두 페이지는 서로 다른 역할 유지

## 용어 정의

spec-fixed.md와 동일하게 사용한다.

| 용어             | 정의                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 전체 목록 페이지 | `/templates` — 카테고리 구분 없이(또는 필터 적용 시 해당 카테고리만) 모든 스타터 킷을 순서대로 나열하는 탐색 전용 페이지 |
| 카테고리 필터    | 화면 상단 칩(All + `STARTER_KIT_CATEGORIES`) 형태 단일 선택 필터                                                         |
| 검색             | 제목·태그를 대상으로 하는 대소문자 무시 부분 일치 실시간 검색. 카테고리 필터와 AND 조건                                  |
| 디바운스 지연    | 검색어 입력이 멈춘 뒤 URL·목록에 반영되기까지 대기하는 시간 = 300ms                                                      |
| 무한스크롤       | 서버 페이지네이션 없이 클라이언트에 로드된 전체 배열을 스크롤 위치에 따라 9개 단위로 점진 노출하는 방식                  |
| 페이지 크기      | 무한스크롤 1회 노출 단위 = 9                                                                                             |

## 관련 문서

- [spec-fixed.md](./spec-fixed.md) — 확정 요구사항, 데이터 구조, 엣지케이스
- [design.md](./design.md) — 디자이너·웹접근성 전문가·프론트엔드 개발자 관점 디자인 노트
- [docs/design/index.md](../design/index.md) — 공통 디자인 규칙 허브
- [../landing/prd.md](../landing/prd.md) — 랜딩페이지 PRD (역할 비교 참고)
