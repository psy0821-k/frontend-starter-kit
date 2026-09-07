# P0 컴포넌트 3종 (Table, Dropdown-menu, Avatar) — spec-fixed

로드맵 2단계 "P0 컴포넌트 완성". PRD(`plan/prd.md` FR-2)가 명시한 P0 12종 중
Table, Dropdown-menu, Avatar 3종이 아직 `src/components/ui/`에 없다. 나머지
9종(Button, Input, Form/form-field, Card, Dialog/alert-dialog, Badge,
Toast/sonner, Skeleton, Tabs)은 이미 존재한다.

## 배경 조사 결과

- 기존 P0 컴포넌트는 shadcn 대신 `@base-ui/react` 프리미티브 + CVA(class-variance-authority)
  조합으로 구현되어 있다(`src/components/ui/tabs.tsx`, `dialog.tsx` 참조). 접근성(키보드
  네비게이션, 포커스 트랩, ARIA)은 프리미티브가 기본 제공하고, 우리 쪽 책임은
  Tailwind 클래스·CVA variant·반응형 브레이크포인트다.
- `@base-ui/react`에 `menu`, `avatar` 프리미티브는 존재하지만 **`table` 프리미티브는
  없다** — Table은 순수 시맨틱 HTML(`<table>`/`<thead>`/`<tbody>`, `scope` 속성)로
  직접 구현해야 한다.
- DoD 4번 기준(사용 예제 1개)은 기존 9종 모두 별도 예제 파일(`*.example.tsx`) 없이
  **실제 프로젝트 코드에서의 사용처**로 충족되어 있었다(예: Tabs →
  `starter-kit-code-viewer.tsx`). 이번 3종도 동일한 방식을 따른다.
- Table이 자연스럽게 쓰일 기존 화면이 없다(`/templates`는 카드형 무한스크롤,
  마이페이지 북마크도 카드 그리드). 확인 결과 신규 화면(`/templates/manage`,
  관리자 전용 템플릿 등록 현황)을 추가해 DoD를 충족하기로 확정했다.
- 사용자 프로필에는 `nickname`만 있고 이미지 URL 필드가 없다(`get-current-user.ts`
  확인). 즉 Avatar는 이번 스코프에서 **폴백(닉네임 첫 글자)만** 표시하며,
  실제 이미지 업로드 기능은 Out of Scope이다.
- `/templates/new`가 이미 관리자 전용 라우트 가드 패턴(`requireAdmin()` +
  권한 없으면 403 대신 `notFound()`)을 갖고 있다 — `/templates/manage`도 동일
  패턴을 그대로 재사용한다.

## 용어 정의

| 용어                     | 의미                                                                                                                        |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| P0 컴포넌트              | PRD FR-2가 명시한 필수 12종 UI 컴포넌트(Button/Input/Form/Card/Dialog/Table/Dropdown-menu/Badge/Toast/Skeleton/Tabs/Avatar) |
| DoD (Definition of Done) | 컴포넌트가 `components/ui`에 편입되기 전 충족해야 하는 4개 기준: 타입 명시, 접근성, 반응형 3단계, 사용 예제 1개             |
| 실사용처                 | 별도 예제 파일이 아니라 실제 프로젝트 화면에서 그 컴포넌트를 사용하는 코드 — 이 프로젝트의 기존 DoD 충족 관행               |

## 확정된 결정 사항

1. **구현 방식**: 기존 9종과 동일하게 `@base-ui/react` 프리미티브(Menu, Avatar) +
   CVA 조합을 따른다. Table은 프리미티브가 없으므로 시맨틱 HTML을 직접 작성한다.
2. **DoD 4번(사용 예제) 충족처**:
   - **Dropdown-menu + Avatar**: `src/app/_components/header.tsx`의 사용자 영역
     (`{user.nickname}님` + 로그아웃 버튼)을 Avatar(클릭 시 Dropdown 트리거) +
     Dropdown-menu(프로필/로그아웃 항목)로 교체한다. 마이페이지 링크는 네비게이션에
     이미 있어 Dropdown 안에서는 제외하고 "프로필"(닉네임 표시, 비활성 항목 또는
     `/mypage`로 가는 링크)과 "로그아웃"만 둔다.
   - **Table**: 신규 라우트 `/templates/manage`(관리자 전용)를 추가해, 전체 템플릿
     목록을 제목/카테고리/등록일/수정일/액션(수정·삭제 링크) 컬럼의 테이블로 보여준다.
     `requireAdmin()` + 권한 없으면 `notFound()` 패턴을 그대로 적용한다.
3. **Avatar 이미지 범위**: 이번 스코프에서는 폴백(닉네임 첫 글자)만 구현한다.
   `src` prop 자체는 받을 수 있게 설계하되, 실제 이미지 URL을 넣을 `profiles.avatar_url`
   컬럼이나 업로드 UI는 만들지 않는다(Out of Scope).
4. **접근성**: Base UI Menu/Avatar 프리미티브가 키보드 네비게이션·포커스 트랩·ARIA를
   기본 제공하므로 별도 커스텀 로직을 추가하지 않는다(Tabs/Dialog와 동일한 패턴).
   Table은 프리미티브가 없으므로 `<caption>`(스크린리더 전용 텍스트), `scope="col"`,
   테이블 헤더-셀 연결을 직접 챙긴다.

## 최소 동작 시나리오

1. 로그인한 사용자가 헤더의 Avatar를 클릭하면 Dropdown-menu가 열리고 "프로필"(닉네임
   표시)과 "로그아웃" 항목이 보인다.
2. 관리자가 `/templates/manage`에 접속하면 전체 템플릿 목록이 테이블로 보인다.
3. 관리자가 아닌 사용자가 `/templates/manage`에 접속하면 404를 만난다.
4. 각 컴포넌트(Table/Dropdown-menu/Avatar)는 모바일/태블릿/데스크톱 3단계에서
   깨지지 않고 표시된다.

## Out of Scope (2단계 초안, PRD에서 최종 확정)

- Avatar 이미지 업로드 기능 및 `profiles.avatar_url` 컬럼 추가
- `/templates/manage`에서의 인라인 수정/일괄 액션(체크박스 다중 선택 등) — 이번엔
  기존 수정/삭제 링크로 이동하는 것까지만
- P1 컴포넌트(DataTable 정렬/필터/페이지네이션, Sheet, Command 등)
- Table의 정렬·필터링 기능 — 이번엔 정적 목록 표시만
