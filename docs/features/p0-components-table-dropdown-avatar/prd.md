# P0 컴포넌트 3종 (Table, Dropdown-menu, Avatar) — PRD

## 개요

PRD(`plan/prd.md` FR-2)가 명시한 P0 12종 중 Table, Dropdown-menu, Avatar 3종이
아직 `src/components/ui/`에 없다. 이 작업은 로드맵 2단계로, 나머지 9종과 동일한
DoD(타입 명시·접근성·반응형 3단계·사용 예제 1개)를 충족하는 원본 컴포넌트
3종을 완성하고, 실제 화면에 적용해 사용 예제 기준을 채운다.

## 사용자 스토리

- 로그인한 사용자로서, 헤더의 프로필 영역을 클릭하면 드롭다운 메뉴가 열려
  내 정보 확인과 로그아웃을 한 곳에서 할 수 있다.
- 관리자로서, `/templates/manage`에서 전체 템플릿을 표 형태로 한눈에 보고
  각 항목의 수정/삭제로 바로 이동할 수 있다.
- 개발자로서, 다음 프로젝트에서 Table/Dropdown-menu/Avatar가 필요할 때
  이 커널의 컴포넌트를 그대로 가져다 쓸 수 있다.

## 기술 결정

### 원본 컴포넌트만 만들고, 조합은 사용처(헤더)가 직접 소유한다

**Context** — Table/Dropdown-menu/Avatar를 `components/ui`에 편입하면서, 헤더에
필요한 "닉네임 표시 + 로그아웃 버튼" 조합을 어느 계층에 둘지 결정해야 한다.
`shared/ui/CLAUDE.md`는 래퍼(조합 컴포넌트)를 "추가 동작(정책 주입)이 있을 때만"
만들라고 명시하고, `shared/CLAUDE.md`의 "2회 규칙"은 실제로 2번째 사용처가
생겼을 때만 커널로 승격하라고 한다.

**Decision** — 이번엔 원본 3종만 `src/components/ui/`에 만든다.

- `table.tsx`: `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`,
  `TableCell`, `TableCaption` — Base UI에 프리미티브가 없으므로 순수 시맨틱
  HTML(`<table>`/`<thead>`/`<tbody>`, `scope` 속성)로 직접 구현
- `dropdown-menu.tsx`: `@base-ui/react/menu` 기반, `DropdownMenu`,
  `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem` 등
- `avatar.tsx`: `@base-ui/react/avatar` 기반, `Avatar`, `AvatarImage`,
  `AvatarFallback`

헤더(`src/app/_components/header.tsx`)는 이 3종(Avatar, DropdownMenu)을 직접
import해 조합한다. 별도의 `UserMenu` 같은 조합 컴포넌트는 만들지 않는다 — 이
조합이 쓰이는 곳이 헤더 하나뿐이라 "2회 규칙"에 못 미친다.

**Alternatives**:

- 안 B(shared/ui에 UserMenu 조합 컴포넌트 추가) — 사용처가 헤더 하나뿐이라
  "2회 규칙" 위반. 지금 만들면 실제로 재사용되지 않는 커널 코드가 되어
  `shared/CLAUDE.md`가 경고하는 "주기적 강등 검토 대상"이 곧바로 생긴다.
- 안 C(헤더 전용 컴포넌트로 한 번에 통합, 원본 분리 안 함) — 이번 목표 자체가
  "Table/Dropdown-menu/Avatar를 P0 원본 컴포넌트로 완성"하는 것이므로, 원본을
  안 만들고 헤더에만 로직을 넣으면 목표를 충족하지 못해 거부.

**Consequences**:

- 장점: 기존 9종(Tabs, Dialog 등)과 동일한 얇은 패턴을 유지해 일관성이
  높고, 과추상화를 피한다.
  단점: 만약 나중에 다른 화면에서도 "아바타+드롭다운" 조합이 필요해지면,
  그때 헤더의 조합 코드를 보고 새로 만들거나 리팩토링해야 한다 — 지금은
  그 비용을 미루는 결정이다.

### Table의 DoD 사용 예제는 신규 관리자 라우트(`/templates/manage`)로 충족한다

**Context** — 기존 화면(`/templates` 카드 목록, 마이페이지 북마크 카드 그리드)
모두 Table이 자연스럽게 어울리지 않는다. Table의 DoD 4번(사용 예제)을 어떻게
충족할지 결정이 필요했다.

**Decision** — 관리자 전용 신규 라우트 `/templates/manage`를 추가해, 전체
템플릿을 제목/카테고리/등록일/수정일/액션(수정·삭제 링크) 컬럼의 표로
보여준다. `/templates/new`가 이미 쓰는 패턴(`requireAdmin()` + 권한 없으면
`notFound()`)을 그대로 재사용한다.

**Alternatives**: 데모 마크업 수준으로만 DoD를 충족하고 실제 라우트 적용은
다음 기회로 미루는 안 — 검토했으나, 이미 관리자가 `/templates` 카드 목록에서
수정/삭제를 개별적으로 하던 것을 한 화면에서 보게 하는 실질적 가치가 있어
이번에 함께 하기로 확정(사용자 승인).

**Consequences**: 장점 — Table의 실사용 가치를 실제로 검증하고, 관리자
워크플로우도 함께 개선된다. 단점 — 이번 이슈의 범위가 "컴포넌트 3종 완성"보다
커진다(신규 라우트 + 데이터 조회 추가). 이슈 분해 단계에서 별도 이슈로
명확히 분리해 범위를 통제한다.

### Avatar는 이번 스코프에서 폴백(이니셜)만 지원한다

**Context** — `getCurrentUser()`가 반환하는 사용자 정보에는 `nickname`만
있고 프로필 이미지 URL 필드가 없다(`get-current-user.ts` 확인).

**Decision** — `Avatar` 컴포넌트 자체는 `AvatarImage`(src prop)를 받을 수
있게 만들되, 이번 헤더 적용에서는 `AvatarFallback`(닉네임 첫 글자)만 실제로
사용한다. `profiles.avatar_url` 컬럼 추가나 이미지 업로드 UI는 이번에 하지
않는다.

**Alternatives**: 프로필 이미지 업로드 기능까지 이번에 함께 구현하는 안 —
검토했으나 P0 컴포넌트 완성이라는 이번 목표와 무관한 별개 기능(DB 마이그레이션,
Storage 업로드 UI)이라 범위를 벗어난다고 판단해 거부(사용자 확인).

**Consequences**: 장점 — 컴포넌트 자체는 이미지 지원까지 설계되어 있어,
나중에 `avatar_url`이 추가되면 헤더 쪽 코드만 한 줄 바꾸면 된다. 단점 —
지금 당장은 모든 사용자의 아바타가 이니셜 폴백으로만 보여 시각적으로
단조롭다.

## Out of Scope

- Avatar 이미지 업로드 기능 및 `profiles.avatar_url` 컬럼 추가
- `/templates/manage`에서의 인라인 수정·일괄 액션(체크박스 다중 선택 등) —
  기존 수정/삭제 링크로 이동하는 것까지만
- P1 컴포넌트(DataTable 정렬/필터/페이지네이션, Sheet, Command 등)
- Table의 정렬·필터링 기능 — 이번엔 정적 목록 표시만
- `shared/ui`에 조합 컴포넌트(UserMenu 등) 추가 — "2회 규칙" 미충족

## 용어 정의

`spec-fixed.md`의 정의를 그대로 따른다: P0 컴포넌트, DoD, 실사용처.
