# 템플릿 수정 기능 — 이슈 분해

PRD([prd.md](./prd.md)) 기준. 백엔드(`PUT /api/templates/[id]`)는 이미 구현되어 있어 이번 기능은 프런트엔드 하나로 완결되는 단일 수직 슬라이스다.

---

## 이슈 1 — 템플릿 수정 화면 구현 (`/templates/[id]/edit`)

### 설명

관리자가 상세 페이지에서 등록된 템플릿을 수정할 수 있는 화면을 구현한다. PRD 결정 1(공통 폼 컴포넌트 + 얇은 래퍼 분리)에 따라 기존 `TemplateRegisterForm`에서 필드 UI를 `TemplateForm`으로 분리하고, 이를 재사용하는 `TemplateEditForm`을 신설한다.

### 변경 지점

- `src/features/starter-kit/ui/template-form.tsx` — 필드 UI 전담 컴포넌트 신설(기존 등록 폼에서 분리)
- `src/features/starter-kit/ui/template-register-form.tsx` — `TemplateForm`을 쓰는 얇은 래퍼로 리팩터링(동작 변경 없음)
- `src/features/starter-kit/ui/template-edit-form.tsx` — 수정 전용 래퍼 신설
- `src/features/starter-kit/api/update-template.ts` — `PUT /api/templates/[id]` 호출 클라이언트 함수 신설
- `src/features/starter-kit/lib/to-form-values.ts` — 조회 결과(`StarterKit`)를 폼 초기값으로 변환하는 유틸 신설
- `src/app/templates/[id]/edit/page.tsx` — 수정 페이지 라우트 신설(관리자 가드, 대상 없음/미권한 모두 404)
- `src/app/templates/[id]/page.tsx` — 관리자에게만 보이는 "수정" 버튼 추가

### Acceptance Criteria

- [x] Given 관리자가 템플릿 상세 페이지(`/templates/[id]`)에 접속했을 때, When 화면을 보면, Then "수정" 버튼이 표시된다.
- [x] Given 관리자가 아닌 사용자가 상세 페이지에 접속했을 때, When 화면을 보면, Then "수정" 버튼이 표시되지 않는다.
- [x] Given 관리자가 "수정" 버튼을 눌러 `/templates/[id]/edit`으로 이동했을 때, When 화면이 로드되면, Then 제목·요약·카테고리·설명·썸네일·태그·주요 기능·사용 기술·파일 목록에 기존 값이 모두 채워져 있다.
- [x] Given 관리자가 일부 필드(예: 요약)를 수정하고 "수정하기"를 눌렀을 때, When 제출이 완료되면, Then 상세 페이지로 이동하고 변경된 값과 갱신된 수정일이 표시된다.
- [x] Given 관리자가 아닌 사용자가 `/templates/[id]/edit`에 직접 접속했을 때, When 페이지가 로드되면, Then 404가 표시된다.
- [x] Given 존재하지 않는 id로 `/templates/[id]/edit`에 접속했을 때, When 페이지가 로드되면, Then 404가 표시된다.
- [x] Given 파일 경로를 다른 파일과 중복되게 수정하고 제출했을 때, When 서버가 CONFLICT를 반환하면, Then "이미 등록된 파일 경로가 있습니다" 메시지가 표시된다.

### 의존성

없음 — 백엔드가 이미 구현되어 있어 프런트엔드 단독으로 완결된다.

### 상태

구현 및 브라우저 검증 완료 (2026-08-10). 실제 등록된 템플릿(`ERP 관리자 대시보드 스타터`)으로 수정 → 제출 → 상세 페이지 반영 → 수정일 갱신까지 end-to-end 확인함.
