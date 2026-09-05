# /starters 라우트 신설 — 이슈 분해

의존성 순서: Issue #1 → Issue #2

---

## Issue #1: `/starters` 목록 페이지 생성 — 스타터 카탈로그

### 설명

`src/features/starter-catalog/` feature를 신설하고, `/starters` 목록 페이지에서
portfolio, erp 두 스타터를 카드 그리드로 노출한다.

### 작업 범위

- `src/features/starter-catalog/model/types.ts`: `Starter` 타입
  (`slug: string`, `title: string`, `summary: string`, `category: string`)
- `src/features/starter-catalog/model/starters.ts`: `STARTERS: Starter[]` 상수
  - `{ slug: 'portfolio', title: '...', summary: '...', category: '포트폴리오' }`
  - `{ slug: 'erp', title: '...', summary: '...', category: 'ERP' }`
- `src/features/starter-catalog/model/get-starter-by-slug.ts`: slug로
  `Starter | undefined`를 반환하는 순수 함수(Issue #2에서 재사용)
- `src/features/starter-catalog/ui/starter-list.tsx`: `STARTERS`를 순회해 카드
  그리드(제목/한줄요약/카테고리 배지/바로가기 링크)로 렌더링
- `src/app/starters/(list)/page.tsx`: `StarterList` 렌더링, `app/`에는 로직 없이
  컴포넌트 호출만

### Acceptance Criteria

- [ ] Given 사용자가 `/starters`에 접속, When 페이지가 로드됨, Then 포트폴리오
      스타터 카드와 ERP 스타터 카드가 각각 제목·한줄요약과 함께 화면에 보인다
- [ ] Given `/starters` 목록 화면, When 포트폴리오 카드의 바로가기 링크를 확인,
      Then 링크가 `/starters/portfolio`를 가리킨다
- [ ] Given `/starters` 목록 화면, When ERP 카드의 바로가기 링크를 확인, Then
      링크가 `/starters/erp`를 가리킨다

---

## Issue #2: `/starters/[slug]` 상세 라우트 — 데모 렌더링 및 404 처리

### 설명

slug에 따라 `PortfolioLandingPage`(portfolio-landing feature) 또는
`DashboardPage`(sales-crm-dashboard feature)를 렌더링한다. 카탈로그에 없는
slug는 404를 반환한다.

### 작업 범위

- `src/app/starters/[slug]/page.tsx`:
  - `getStarterBySlug(slug)`(Issue #1에서 만든 함수)로 카탈로그 존재 여부 확인,
    없으면 `notFound()`
  - `slug === 'portfolio'`이면 `PortfolioLandingPage`(named export) 렌더링
  - `slug === 'erp'`이면 `DashboardPage`(default export) 렌더링

### Acceptance Criteria

- [ ] Given 사용자가 `/starters/portfolio`에 접속, When 페이지가 로드됨, Then
      터미널 히어로(`whoami` 커맨드 라인)를 포함한 포트폴리오 랜딩 화면이 보인다
- [ ] Given 사용자가 `/starters/erp`에 접속, When 페이지가 로드됨, Then
      "영업관리 대시보드" 제목과 KPI/차트 섹션이 포함된 대시보드 화면이 보인다
- [ ] Given 사용자가 `/starters/unknown-slug`처럼 카탈로그에 없는 slug로 접속,
      When 페이지가 로드됨, Then 404 Not Found 화면이 보인다

### 의존성

- Issue #1의 `Starter` 타입과 `getStarterBySlug` 함수를 그대로 재사용한다.
