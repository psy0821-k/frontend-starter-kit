# P0 컴포넌트 3종 (Table, Dropdown-menu, Avatar) — 이슈 분해

의존성 순서: Issue #1, #2는 서로 독립적으로 진행 가능(공유 파일 없음).

---

## Issue #1: Avatar + Dropdown-menu 원본 완성 및 헤더 적용

### 설명

`@base-ui/react`의 `avatar`, `menu` 프리미티브를 기반으로 `Avatar`,
`DropdownMenu` 원본 컴포넌트를 `src/components/ui/`에 완성하고, 헤더
(`src/app/_components/header.tsx`)의 로그인 사용자 영역(현재
`{user.nickname}님` + 로그아웃 버튼)을 Avatar(클릭 트리거) + Dropdown-menu
(프로필/로그아웃 항목)로 교체한다.

### 작업 범위

- `src/components/ui/avatar.tsx`: `Avatar`, `AvatarImage`, `AvatarFallback`
  (기존 9종과 동일하게 CVA + `data-slot` 패턴)
- `src/components/ui/dropdown-menu.tsx`: `DropdownMenu`, `DropdownMenuTrigger`,
  `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuSeparator` 등
  (`@base-ui/react/menu` 기반)
- `src/app/_components/header.tsx` 수정: 로그인 사용자 영역을 Avatar+Dropdown으로
  교체. Dropdown 안에는 "프로필"(닉네임 표시, 클릭 시 `/mypage` 이동 또는 비활성
  표시)과 "로그아웃" 항목만 둔다. 네비게이션의 기존 "마이페이지" 링크는 그대로 유지.
  `LogoutButton`의 실제 로그아웃 로직은 재사용한다.
- Avatar는 `AvatarFallback`(닉네임 첫 글자)만 실제 사용 — `AvatarImage`는 컴포넌트
  자체는 지원하되 이번 헤더 적용에서 src를 넘기지 않는다(Out of Scope: 이미지
  업로드).

### Acceptance Criteria

- [ ] Given 로그인한 사용자가 페이지에 접속, When 헤더를 확인, Then 사용자
      영역에 닉네임 첫 글자가 표시된 Avatar가 보인다
- [ ] Given 로그인한 사용자, When 헤더의 Avatar를 클릭, Then 드롭다운 메뉴가
      열리고 "프로필"(닉네임 표시)과 "로그아웃" 항목이 보인다
- [ ] Given 드롭다운 메뉴가 열린 상태, When "로그아웃"을 클릭, Then 기존
      로그아웃 동작(세션 종료 후 리다이렉트)이 그대로 수행된다
- [ ] Given 드롭다운 메뉴가 열린 상태, When 키보드로 화살표 키를 누름, Then
      메뉴 항목 간 포커스가 이동한다(Base UI Menu 프리미티브 기본 동작)
- [ ] Given 드롭다운 메뉴가 열린 상태, When Esc 키를 누름, Then 메뉴가 닫히고
      포커스가 트리거(Avatar)로 돌아온다
- [ ] Given 모바일/태블릿/데스크톱 뷰포트, When 헤더를 확인, Then Avatar와
      드롭다운이 레이아웃 깨짐 없이 표시된다

---

## Issue #2: Table 원본 완성 및 `/templates/manage` 관리자 라우트

### 설명

순수 시맨틱 HTML 기반 `Table` 원본 컴포넌트를 `src/components/ui/`에 완성하고,
관리자 전용 신규 라우트 `/templates/manage`에서 전체 템플릿 목록을 표로
보여준다.

### 작업 범위

- `src/components/ui/table.tsx`: `Table`, `TableHeader`, `TableBody`,
  `TableRow`, `TableHead`, `TableCell`, `TableCaption`(스크린리더 전용 텍스트
  지원, `scope="col"` 적용)
- `src/app/templates/manage/page.tsx`: 신규 라우트. `requireAdmin()` +
  권한 없으면 `notFound()` 패턴(`templates/new/page.tsx`와 동일)
- 템플릿 전체 목록 조회는 기존 `getStarterKits()`를 재사용
- 컬럼: 제목 | 카테고리 | 등록일 | 수정일 | 액션(수정 링크 `/templates/[id]/edit`,
  삭제는 기존 `DeleteTemplateDialog` 재사용 또는 상세 페이지로의 링크)

### Acceptance Criteria

- [ ] Given 관리자 권한 사용자가 `/templates/manage`에 접속, When 페이지가
      로드됨, Then 전체 템플릿이 제목/카테고리/등록일/수정일 컬럼의 표로
      보인다
- [ ] Given `/templates/manage` 테이블, When 특정 행의 "수정" 링크를 클릭,
      Then 해당 템플릿의 `/templates/[id]/edit`로 이동한다
- [ ] Given 관리자 권한이 없는 로그인 사용자(또는 비로그인 사용자), When
      `/templates/manage`에 접속, Then 404 Not Found 화면이 보인다
- [ ] Given 모바일 뷰포트, When `/templates/manage`를 확인, Then 테이블이
      가로 스크롤 등으로 레이아웃이 깨지지 않고 표시된다
