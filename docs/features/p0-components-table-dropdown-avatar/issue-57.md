# Issue #57 — Table 원본 완성 및 /templates/manage 관리자 라우트

## 시그니처

### 1. `src/components/ui/table.tsx`

기존 `shared/ui` 래퍼가 감쌀 원본(raw) 컴포넌트. `@base-ui/react`에 table
프리미티브가 없으므로 순수 시맨틱 HTML(`<table>`, `<thead>` 등)을 직접
`data-slot` 패턴으로 감싼다. CVA는 variant가 없으므로 사용하지 않는다
(`skeleton.tsx`와 동일한 최소 패턴 — `React.ComponentProps<'tag'>` + `cn` +
`data-slot`).

```ts
// 스크롤 컨테이너까지 포함한 최상위 래퍼
function Table({ className, ...props }: React.ComponentProps<'table'>): React.JSX.Element;

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>): React.JSX.Element;

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>): React.JSX.Element;

function TableRow({ className, ...props }: React.ComponentProps<'tr'>): React.JSX.Element;

// scope="col" 고정 적용 — 헤더 셀 전용
function TableHead({ className, ...props }: React.ComponentProps<'th'>): React.JSX.Element;

function TableCell({ className, ...props }: React.ComponentProps<'td'>): React.JSX.Element;

// 스크린리더 전용 텍스트(시각적으로 숨김, sr-only) — 표의 목적을 설명
function TableCaption({ className, ...props }: React.ComponentProps<'caption'>): React.JSX.Element;

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption };
```

- `any` 사용 금지 — 모든 props는 해당 HTML 엘리먼트의 `React.ComponentProps<'tag'>`를 그대로 확장.
- `Table`은 내부에서 가로 스크롤 컨테이너(`div` + `overflow-x-auto`)로 `<table>`을 감싸 AC4(모바일 반응형)를 컴포넌트 레벨에서 보장한다. 컨테이너는 `data-slot="table-container"`.
- `TableHead`는 `scope="col"`을 기본값으로 고정한다(이슈 본문 명시 요구사항). props로 덮어쓸 필요가 생기면 그때 열어준다(YAGNI).
- 에러 케이스 없음 — 순수 프레젠테이션 컴포넌트, 런타임 예외를 던지지 않는다.

### 2. `src/app/templates/manage/page.tsx`

```ts
export default async function TemplateManagePage(): Promise<React.JSX.Element>;
```

- 파라미터 없음(동적 세그먼트 없는 정적 라우트).
- `requireAdmin()` 호출 → 실패(throw) 시 `catch` 블록에서 `notFound()` 호출.
  `templates/new/page.tsx`와 완전히 동일한 패턴을 그대로 재사용한다(신규
  유틸 불필요 — `requireAdmin`은 이미 404를 위한 `ApiError(404, 'NOT_FOUND', ...)`를
  던지도록 구현되어 있음, `src/shared/api/auth/require-admin.ts` 참조).
- 데이터 조회: `getStarterKits(): Promise<StarterKit[]>` 재사용(신규 API 불필요).
  목록 페이지(`templates/(list)/page.tsx`)와 달리 검색/카테고리 필터/북마크는
  이 라우트의 요구사항이 아니므로 가져오지 않는다(YAGNI — AC에 없음).
- 정렬: 기존 목록 페이지와 동일하게 `updated_at` 내림차순으로 클라이언트 정렬(추가
  정렬 옵션 UI는 AC에 없으므로 구현하지 않음).
- 표 컬럼: 제목 | 카테고리 | 등록일(`created_at`) | 수정일(`updated_at`) | 액션.
  액션 셀에는 `/templates/${id}/edit`로 가는 "수정" 링크(`buttonVariants({ variant: 'outline', size: 'sm' })`,
  `templates/[id]/page.tsx`와 동일한 스타일)와 기존 `DeleteTemplateDialog`
  (`templateId`, `templateTitle` props 그대로)를 재사용한다. 신규 컴포넌트를
  만들지 않는다("2회 규칙" — 삭제 UI는 이미 상세 페이지에서 1회 사용 중이며
  이번이 2번째 사용처이므로 커널 승격이 아니라 기존 컴포넌트를 그대로 import).
- 날짜 포맷: 목록/상세 페이지에 이미 쓰는 날짜 표시 패턴이 있으면 그대로
  따른다(`StarterKitMetaDates` 등 기존 유틸 재사용 우선, 신규 포맷 함수 작성 금지 — 구현 단계에서 실제 재사용 가능 여부 확인).
- 빈 목록(템플릿 0개) 시: 표 자체는 렌더링하되 `TableBody`에 안내 메시지 1행(`colSpan`으로 전체 컬럼 병합) 표시. 별도 `AsyncBoundary`의 empty 분기까지는 이 라우트가 서버 컴포넌트이고 로딩/에러 상태가 없으므로 불필요(YAGNI).
- 에러 케이스: `requireAdmin()` throw → `notFound()`(위 참조). `getStarterKits()`는 내부적으로 Supabase 에러 시 mock 데이터로 폴백하므로 이 페이지 레벨에서 별도 에러 처리를 하지 않는다(기존 `getStarterKits` 계약을 그대로 신뢰).

## AC 대조

| AC                                                           | 커버 방식                                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC1: 관리자가 접속하면 제목/카테고리/등록일/수정일 표로 보임 | 시나리오 1~4 (유닛: 페이지 컴포넌트 렌더 결과에 컬럼별 텍스트 존재 확인)                                                                                                                                                                                                            |
| AC2: "수정" 링크 클릭 시 `/templates/[id]/edit`로 이동       | 시나리오 5 (유닛: 링크의 `href` 속성 검증)                                                                                                                                                                                                                                          |
| AC3: 권한 없는/비로그인 사용자는 404                         | 시나리오 6~7 (유닛: `requireAdmin` mock으로 reject 시 `notFound` 호출 검증 — `templates/new/page.tsx` 기존 테스트 패턴 재사용)                                                                                                                                                      |
| AC4: 모바일 뷰포트에서 레이아웃 안 깨짐(가로 스크롤)         | **E2E로 위임** — 유닛 테스트로 실제 뷰포트 렌더링/스크롤 동작을 검증하기 어려움(이슈 #56 사례와 동일 판단). `Table` 컴포넌트에 `overflow-x-auto` 컨테이너가 있는지는 유닛 테스트(시나리오 8)로 정적 검증하고, 실제 시각적 가로 스크롤 여부는 Playwright E2E 대상으로 명시 위임한다. |

4개 AC 모두 커버(AC4는 유닛 8 + E2E 위임 조합).

---

## 테스트 시나리오

### `Table` 원본 컴포넌트 (`src/components/ui/table.tsx`)

1. **정상** — should render a table element wrapped in a horizontally scrollable container when Table is rendered
   - `Table`을 렌더링하면 `data-slot="table-container"` div(`overflow-x-auto` 클래스 포함) 안에 `<table data-slot="table">`이 존재해야 한다.
2. **정상** — should render thead/tbody/tr/th/td with correct data-slot attributes when each sub-component is used
   - `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` 각각이 올바른 시맨틱 태그(`thead`/`tbody`/`tr`/`th`/`td`)와 `data-slot` 값을 갖는다.
3. **경계** — should apply scope="col" by default when TableHead is rendered without explicit scope
   - `TableHead`를 `scope` prop 없이 렌더링하면 결과 DOM의 `scope` 속성이 `"col"`이어야 한다.
4. **정상** — should render visually-hidden caption text when TableCaption is used
   - `TableCaption`이 `sr-only`(또는 동등한 스크린리더 전용) 클래스를 포함해 렌더링되어야 한다.
5. _(시각 검증 대상, E2E 위임)_ — should not break layout and should scroll horizontally when viewport is narrow (AC4)
   - Playwright: 모바일 뷰포트(예: 375px 너비)에서 `/templates/manage` 접속 시 표 컨테이너가 가로 스크롤 가능하고 페이지 전체 레이아웃이 깨지지 않는지 확인. **유닛 테스트 시나리오에서 제외.**

### `/templates/manage` 페이지 (`src/app/templates/manage/page.tsx`)

6. **정상** — should render a table with title/category/created/updated columns when an admin user visits the page
   - `requireAdmin`을 resolve하도록 mock하고 `getStarterKits`가 템플릿 배열을 반환하도록 mock한 뒤 페이지를 렌더링하면, 각 템플릿의 제목·카테고리·등록일·수정일 텍스트가 표에 존재해야 한다.
7. **정상** — should render an edit link pointing to /templates/[id]/edit for each row (AC2)
   - 각 행에 `href="/templates/{id}/edit"`인 링크가 존재해야 한다.
8. **정상** — should render a delete action reusing DeleteTemplateDialog for each row
   - 각 행에 `DeleteTemplateDialog`가 `templateId`/`templateTitle` props와 함께 렌더링되어야 한다(모듈 mock으로 호출 props 검증).
9. **예외** — should call notFound when requireAdmin rejects (non-admin or unauthenticated user) (AC3)
   - `requireAdmin`이 reject하도록 mock하면 `next/navigation`의 `notFound`가 호출되어야 한다.
10. **경계** — should render an empty-state row spanning all columns when there are no templates
    - `getStarterKits`가 빈 배열을 반환하면, 데이터 행 대신 안내 메시지 1행(전체 컬럼 `colSpan`)이 렌더링되어야 한다.
11. **경계** — should sort templates by updated_at descending when multiple templates exist
    - `updated_at`이 서로 다른 템플릿 여러 개를 반환하도록 mock하면, 표의 행 순서가 최신순이어야 한다.

## AC4 E2E 검증 (`src/app/templates/manage/manage.e2e.ts`)

시나리오 5에서 유닛 테스트로는 검증할 수 없다고 명시했던 부분을 Playwright E2E로 보강했다.

- **로그인 방식**: 세션/쿠키 직접 주입이 아니라 `/auth/login` 페이지에 실제로 접속해
  로그인 폼(`LoginForm`)에 관리자 테스트 계정(`test-admin@example.com` /
  `TestPassword123!`, `plan/test-accounts.md` "관리자 테스트 계정" 참조)을 입력·제출하는
  방식으로 로그인한다. 비밀번호 입력란은 `PasswordInput`이 표시 토글 버튼도 함께
  렌더링해 `getByLabel('비밀번호')`가 2개 요소(입력창 + 버튼)에 매칭되므로,
  `getByRole('textbox', { name: '비밀번호' })`로 좁혀 입력한다.
- **뷰포트**: 이 프로젝트의 `playwright.config.ts`에는 데스크톱 chromium 프로젝트 1개만
  정의되어 있어 별도 모바일 프로젝트가 없다. `test.use({ viewport: { width: 375, height: 667 } })`로
  테스트 파일 단위에서 모바일 뷰포트(iPhone SE 폭 기준)를 오버라이드한다.
- **검증 항목**:
  1. 페이지 전체(`document.documentElement`)에는 `scrollWidth > clientWidth`인
     가로 스크롤이 발생하지 않는다.
  2. `Table` 컴포넌트가 렌더링하는 `[data-slot="table-container"]`는
     `overflow-x: auto`로 컨테이너 내부 가로 스크롤만 허용한다.
  3. 표(`role="table"`)가 화면에 정상적으로 보이고, 컬럼 헤더 5개(제목/카테고리/등록일/수정일/액션)가 렌더링된다.
- **결과**: 3개 시나리오 모두 통과. 기존 유닛 테스트(248개) 및 나머지 E2E(25개, 총 28개)에
  회귀 없음.
