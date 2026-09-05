# /starters 라우트 신설 — PRD

## 개요

`docs/routing.md`가 정의한 Starter/Template/Feature 3분류 중 `/starters`가 아직
라우트로 구현되지 않았다. 이 작업은 로드맵 1단계 "커널/라우팅 구조 정리"의
남은 부분을 완료하기 위해, 이미 코드로 존재하는 두 데모 콘텐츠
(`portfolio-landing`, `sales-crm-dashboard`)를 `/starters/[slug]` 라우트와
`/starters` 목록 페이지로 연결한다.

## 사용자 스토리

- 사용자로서, `/starters`에 접속하면 선택 가능한 스타터 종류(포트폴리오, ERP
  대시보드)를 카드 목록으로 확인할 수 있다.
- 사용자로서, 목록에서 스타터를 클릭하면 `/starters/[slug]`에서 해당 스타터의
  실제 데모 화면을 바로 볼 수 있다.
- 사용자로서, 존재하지 않는 slug로 접근하면 404 페이지를 만난다.

## 기술 결정

### 스타터 카탈로그를 별도 feature로 분리한다

**Context** — `/starters` 목록·상세 라우트가 스타터 메타데이터(slug, title,
summary, 렌더링할 컴포넌트)를 조회할 방법이 필요하다. `app/` 레이어에는 로직을
넣지 않는다는 프로젝트 원칙(`CLAUDE.md`)이 있어, 이 조회 로직을 어디에 둘지
결정해야 한다.

**Decision** — `src/features/starter-catalog/`를 신설한다.

- `model/types.ts`: `Starter` 타입(`slug`, `title`, `summary`, `category`) 정의
- `model/starters.ts`: `STARTERS: Starter[]` 정적 상수 배열
- `model/get-starter-by-slug.ts`: slug로 카탈로그 항목을 찾는 순수 함수
- `ui/starter-list.tsx`: 카탈로그 배열을 카드 그리드로 렌더링하는 컴포넌트
- 실제 데모 컴포넌트(`PortfolioLandingPage`, `DashboardPage`)는 각자의 기존
  feature(`portfolio-landing`, `sales-crm-dashboard`)에 그대로 둔다.
  `starter-catalog`는 이들을 소유하지 않고, `app/starters/[slug]/page.tsx`가
  slug에 따라 필요한 컴포넌트를 직접 import해 분기 렌더링한다(카탈로그는
  메타데이터만 책임지고, 실제 컴포넌트 트리 조합은 라우트 레이어의 책임으로
  남긴다 — `features` 간 직접 import 금지 원칙에 따라 `starter-catalog`가
  다른 데모 feature를 import하지 않는다).

**Alternatives**:

- 안 B(라우트에 인라인 데이터) — 가장 빠르지만 `app/`에 데이터+분기 로직이
  들어가 "app/ — 로직 넣지 않음" 원칙을 정면으로 위배해 거부.
- 안 C(각 데모 feature에 메타데이터 분산) — feature 개수가 늘어날수록 카탈로그
  전체 목록을 한눈에 파악하기 어렵고, 목록 페이지가 여러 feature의 메타를
  일일이 import해야 해 결합도가 오히려 올라가 거부.

**Consequences**:

- 장점: `/templates`(`starter-kit` feature)와 구조적으로 대응되어 코드베이스
  전체의 일관성이 높아진다. 스타터가 3개 이상으로 늘어도 카탈로그 배열에
  항목만 추가하면 확장 가능하다.
  단점: 스타터가 2종뿐인 현재 시점에는 별도 feature 폴더 하나를 새로 만드는
  것이 오버엔지니어링처럼 보일 수 있다. 다만 이는 "2회 규칙"의 예외로, 이미
  `/templates`라는 선례가 있어 처음부터 그 패턴을 따르는 편이 나중에 되돌리는
  비용보다 낮다고 판단했다.

### 렌더링은 서버 컴포넌트로, 클라이언트 변환 없이 그대로 조합한다

**Context** — `portfolio-landing-page.tsx`(named export)와
`dashboard-page.tsx`(default export) 모두 이벤트 핸들러나 `<style>` 태그 없는
순수 정적 컴포넌트임을 코드 확인으로 검증했다.

**Decision** — `app/starters/[slug]/page.tsx`를 서버 컴포넌트로 유지하고, slug에
따라 해당 컴포넌트를 그대로 렌더링한다. 별도의 `'use client'` 전환이나 래퍼가
필요 없다.

**Alternatives**: 모든 스타터를 클라이언트 컴포넌트로 감싸는 안 — 불필요한
번들 크기 증가와 SSR 이점 상실이라 거부.

**Consequences**: 장점 — 별도 처리 없이 그대로 재사용 가능해 구현이 단순하다.
단점 — 향후 스타터 콘텐츠에 인터랙션(이벤트 핸들러)이 추가되면 그 시점에
`'use client'` 경계를 다시 설계해야 한다(현재는 해당 사항 없음).

## Out of Scope

- `/starters`에 DB 테이블 신설 — 스타터 2종뿐인 현재 단계에서 과설계(YAGNI).
  3개 이상으로 늘어나는 시점에 재검토.
- 북마크 버튼, 관리자 수정/삭제 CRUD — Starter는 DB 엔티티가 아니므로
  "수정/삭제" 개념이 성립하지 않는다. 북마크는 현재 `targetType: 'template'`
  로만 설계되어 있어 확장하려면 스키마 변경이 필요하다.
- `photographer-portfolio`, `devops-portfolio`의 스타터 중복 조립 — 이미
  `/templates`에 등록되어 실사용 가능하므로 제외.
- `src/features/landing/`(서비스 루트 `/` 랜딩페이지, 비디오·웨이브 애니메이션)
  병합 — 별도 브랜치에만 존재하며 이 작업과 무관.
- 스타터 3종 이상으로 확장(쇼핑몰 등) — 현재는 portfolio, erp 2종만.
- `/about` 라우트 구현 — 로드맵 1단계 항목이지만 이번 이슈 분해에서는 별도
  트래킹(추후 별도 스코프로 분리, 이번 PRD에는 포함하지 않음).

## 용어 정의

`spec-fixed.md`의 정의를 그대로 따른다: Starter, slug, 스타터 카탈로그.
