# Feature 상세 페이지 — 이슈 분해

**PRD**: [prd.md](./prd.md)
**확정 스펙**: [spec-fixed.md](./spec-fixed.md)

## 이슈 A — Feature 상세 페이지 신설

### 배경

`/features` 목록의 `FeatureCard`는 클릭해도 아무 동작이 없다. `features`/`feature_files` DB
테이블은 이미 존재하므로, 상세 조회 API·페이지·코드 뷰어·404·SEO metadata를 이번 이슈에서 함께
만든다(하나로 묶는 이유: 어느 한 조각만 있어도 사용자에게 보여줄 동작이 없기 때문 — 카드를
클릭 가능하게만 해도 상세 페이지가 없으면 404, 상세 페이지만 만들어도 진입 경로가 없으면 죽은
라우트).

### 변경 범위

- `src/features/feature-catalog/model/types.ts` — `FeatureDetail`, `FeatureFile` 타입 추가
- `src/features/feature-catalog/api/get-feature-by-id.ts` 신규 — `getFeatureById(id)`,
  `getStarterKitById`와 동일 패턴(PostgREST 임베딩으로 `feature_files` 단일 요청 조회, 미존재 시
  `null`)
- `src/features/feature-catalog/ui/feature-card.tsx` — `onSelect` prop 추가, `<button>` 래핑
  (`StarterKitCard`와 동일 구조)
- `FeatureList`(또는 상위 컨테이너) — `router.push(`/features/${feature.id}`)` 연결
- `src/app/features/[id]/page.tsx` 신규 — 서버 컴포넌트, `notFound()` 분기, `generateMetadata`
  추가(`title`/`summary` → `title`/`description`, 미존재 시 정적 fallback)
- 코드 뷰어: `StarterKitCodeViewer`를 `FeatureFile[]`에 재사용(타입 호환 확인됨)
- `feature_files`가 0건이면 코드 뷰어 섹션 숨김

### Out of Scope (이 이슈)

- 북마크 버튼 배치 — 이슈 B에서 진행
- 관리자 등록/수정/삭제 UI
- 목록(`/features`) 조회 쿼리 변경(4개 필드 유지)
- `feature_files` 코드 문법 하이라이팅
- `StarterKitCard`/`FeatureCard`의 `<Link>` 전환

### Acceptance Criteria

- [ ] Given `/features` 목록 페이지에서, When 사용자가 Feature 카드를 클릭하면, Then
      `/features/{id}`로 이동한다.
- [ ] Given `/features` 목록 페이지에서, When 사용자가 카드에 포커스를 준 뒤 Enter 또는
      Space를 누르면, Then `/features/{id}`로 이동한다.
- [ ] Given 존재하는 Feature id로, When `/features/{id}`에 접속하면, Then `title`/`summary`/
      `description`/`category`/`tags`/`tech_stack`/`usage`가 화면에 표시된다.
- [ ] Given `feature_files`가 1건 이상 있는 Feature 상세 페이지에서, When 페이지를 로드하면,
      Then 구성 파일의 코드가 코드 뷰어에 표시된다.
- [ ] Given `feature_files`가 0건인 Feature 상세 페이지에서, When 페이지를 로드하면, Then 코드
      뷰어 섹션이 보이지 않는다.
- [ ] Given 존재하지 않는 Feature id로, When `/features/{id}`에 접속하면, Then 404 페이지가
      표시된다(HTTP 상태코드 404).
- [ ] Given 존재하는 Feature id로, When 페이지의 메타데이터를 확인하면, Then `<title>`이 해당
      Feature의 `title`로 설정되어 있다.
- [ ] Given 존재하지 않는 Feature id로, When 페이지의 메타데이터를 확인하면, Then fallback
      제목("Feature를 찾을 수 없습니다")이 설정되어 있다.

### 의존성

없음(선행 이슈 없이 바로 시작 가능).

---

## 이슈 B — Feature 상세 페이지 북마크 연동

### 배경

이슈 A로 상세 페이지가 생긴 뒤, 로그인 사용자가 그 페이지에서 바로 북마크를 추가/해제할 수
있게 한다. `templates/[id]`에서 이미 검증된 `BookmarkButton` 패턴을 `target_type: 'feature'`로
재사용한다.

### 변경 범위

- `src/app/features/[id]/page.tsx` — 헤더 영역에 `BookmarkButton`
  (`target: { targetType: 'feature', targetId: feature.id }`) 배치
- `getBookmarkStateForServer`로 서버에서 초기 북마크 상태 조회 후 전달

### Out of Scope (이 이슈)

- `BookmarkButton` 컴포넌트 자체의 신규 구현(이미 존재 — 재사용만)
- 비로그인 사용자 전용 UI 변경(기존 `isAuthenticated` 분기 그대로 재사용)

### Acceptance Criteria

- [ ] Given 로그인한 사용자가 아직 북마크하지 않은 Feature 상세 페이지에서, When 북마크
      버튼을 클릭하면, Then 버튼이 "북마크됨" 상태로 바뀐다.
- [ ] Given 로그인한 사용자가 이미 북마크한 Feature 상세 페이지에서, When 북마크 버튼을
      클릭하면, Then 버튼이 "북마크 안 됨" 상태로 바뀐다.
- [ ] Given 로그인한 사용자가 이미 북마크한 Feature 상세 페이지를 새로고침하면, When 페이지가
      로드되면, Then 북마크 버튼이 "북마크됨" 상태로 초기 렌더링된다.
- [ ] Given 비로그인 사용자가 Feature 상세 페이지에서, When 북마크 버튼을 클릭하면, Then
      로그인 페이지로 이동한다.

### 의존성

**이슈 A 완료 후 진행** — `/features/[id]` 페이지가 존재해야 버튼을 배치할 수 있다.
