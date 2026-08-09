# 템플릿 생성 기능 — 이슈 분해

PRD([prd.md](./prd.md)) 기준. 두 이슈는 서로 다른 영역(카테고리 값 / 썸네일 업로드)을 다루며 독립적으로 진행 가능하다.

---

## 이슈 1 — 템플릿 카테고리를 erp/포트폴리오/쇼핑몰로 변경

### 설명

템플릿 등록·조회·필터 전 지점에서 쓰이는 카테고리 값을 `Frontend/Backend/Fullstack/Mobile`에서 `erp/포트폴리오/쇼핑몰`로 교체한다. PRD 결정 1(enum 값 직접 교체)에 따라 DB CHECK 제약, Zod enum, mock 데이터, 등록 폼 select, 목록 필터 칩까지 한 번에 바꿔야 화면에서 실제로 새 카테고리로 동작하는 것을 확인할 수 있다.

### 변경 지점 (참고용 체크리스트 — 이슈 자체를 이 기준으로 쪼개지 않는다)

- `supabase/migrations/` — `templates.category` CHECK 제약을 새 마이그레이션으로 갱신
- `src/features/starter-kit/model/types.ts` — `STARTER_KIT_CATEGORIES` 값 교체
- `src/features/starter-kit/api/mock-data.ts` — mock 템플릿의 category 값을 새 값으로 갱신
- `src/features/starter-kit/ui/template-register-form.tsx` — select가 새 상수를 그대로 순회하므로 코드 변경은 불필요, 동작 확인만
- `src/features/starter-kit/ui/starter-kit-category-filter.tsx` — 필터 칩이 새 상수를 그대로 순회하므로 코드 변경은 불필요, 동작 확인만
- `supabase/seed/001_seed_templates.sql` — 시드 데이터 category 값 갱신

### Acceptance Criteria

- [ ] Given 관리자가 템플릿 등록 화면(`/templates/new`)에 접속했을 때, When 카테고리 select를 열면, Then `erp` / `포트폴리오` / `쇼핑몰` 3개 옵션만 표시된다.
- [ ] Given 관리자가 카테고리를 `포트폴리오`로 선택해 템플릿을 등록했을 때, When 등록이 완료되면, Then 상세 페이지에 카테고리가 `포트폴리오`로 표시된다.
- [ ] Given 템플릿 목록 페이지(`/templates`)에 접속했을 때, When 카테고리 필터 칩을 확인하면, Then `All` / `erp` / `포트폴리오` / `쇼핑몰` 칩이 표시된다.
- [ ] Given 목록에 서로 다른 카테고리의 템플릿이 등록되어 있을 때, When `쇼핑몰` 필터 칩을 클릭하면, Then `쇼핑몰` 카테고리 템플릿만 목록에 표시된다.
- [ ] Given 기존 `Frontend/Backend/Fullstack/Mobile` 값으로 카테고리를 등록하려는 요청이 API에 직접 들어왔을 때(RLS/스키마 우회 시도), When 서버가 요청을 검증하면, Then 유효성 에러로 거부된다.

### 의존성

없음 — 독립적으로 시작 가능.

---

## 이슈 2 — 템플릿 썸네일을 Supabase Storage 업로드 방식으로 변경

### 설명

썸네일 입력을 텍스트(경로/URL) 입력에서 실제 이미지 파일 업로드로 바꾼다. PRD 결정 2(클라이언트 직접 업로드)에 따라 public 버킷을 만들고 RLS로 업로드 권한을 관리자로 제한한 뒤, 등록 폼에서 파일을 선택하면 브라우저가 Supabase Storage에 직접 업로드하고 반환된 공개 URL을 기존 `thumbnail_url` 값으로 사용한다.

### 변경 지점 (참고용 체크리스트 — 이슈 자체를 이 기준으로 쪼개지 않는다)

- Storage 버킷 생성(public) + RLS 정책(관리자만 INSERT/UPDATE 허용, 조회는 공개)
- `src/features/starter-kit/api/` — Storage 업로드 함수 추가(`createSupabaseBrowserClient` 재사용)
- `src/features/starter-kit/ui/template-register-form.tsx` — 썸네일 텍스트 입력을 파일 input + 업로드 상태(로딩/에러) UI로 교체
- `src/features/starter-kit/model/schema.ts` — `thumbnail_url`은 여전히 URL 문자열이므로 스키마 자체는 변경 불필요, 업로드 완료 후 값 세팅 방식만 바뀜

### Acceptance Criteria

- [ ] Given 관리자가 템플릿 등록 화면에서 썸네일 필드를 확인할 때, When 화면을 보면, Then 텍스트 입력이 아닌 파일 선택(업로드) UI가 표시된다.
- [ ] Given 관리자가 이미지 파일을 선택했을 때, When 업로드가 진행되는 동안, Then 로딩 상태가 표시되고 완료되면 미리보기 또는 업로드된 파일명이 표시된다.
- [ ] Given 관리자가 썸네일 업로드를 완료하고 나머지 필드를 채운 뒤 등록했을 때, When 등록이 완료되면, Then 상세 페이지에서 업로드한 이미지가 썸네일로 정상 노출된다.
- [ ] Given 관리자가 아닌 사용자가 Storage 업로드 엔드포인트에 직접 요청을 보냈을 때(RLS 우회 시도), When 요청이 처리되면, Then 업로드가 거부된다.
- [ ] Given 업로드 중 네트워크 오류 등으로 실패했을 때, When 에러가 발생하면, Then 폼에 실패 메시지가 표시되고 제출이 진행되지 않는다.

### 의존성

없음 — 독립적으로 시작 가능. 이슈 1과 병행 가능.
