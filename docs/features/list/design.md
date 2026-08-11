# Templates 생성/수정/삭제 — 상세 설계

**상위 문서**: [spec.md](./spec.md)

---

## 1. 개요

`/templates` 메뉴는 재사용 가능한 페이지 단위의 템플릿을 관리하는 공간입니다. 현재는 **목록 조회(`/templates`)와 상세 조회(`/templates/[id]`)**만 구현되어 있고, **생성/수정/삭제 기능은 관리자 전용**으로 추가합니다.

### 현재 구현 상태

- ✅ 목록 페이지: 검색, 카테고리 필터, 무한스크롤
- ✅ 상세 페이지: 메타 정보, 코드 뷰어
- ✅ 생성 페이지 (`/templates/new`), 수정 페이지 (`/templates/[id]/edit`), 삭제 기능 — 구현 및 테스트 완료 ([progress.md](./progress.md) 참고)

> 아래 §2~§3의 필드명(`name`, `Template`, `CreateTemplateRequest` 등)은 최초 설계 초안이며,
> 실제 구현은 기존 도메인 타입(`StarterKit`, `title`, `templateFormSchema` 등, `src/features/starter-kit/model/`)을
> 그대로 따릅니다. 실제 스키마는 `src/features/starter-kit/model/schema.ts`와
> `src/features/starter-kit/model/types.ts`를 단일 진실 공급원으로 참조하세요.

---

## 2. 기능 정의

### 2.1 생성 (Create)

**경로**: `POST /api/templates` + UI: `/templates/new`

**요구사항**:

1. 관리자만 접근 가능 (진입 시 권한 확인, 미보유 시 404 반환)
2. 폼 항목:
   - 템플릿명 (필수, 문자열 1-100자)
   - 설명 (선택, 텍스트 1-500자)
   - 카테고리 (필수, 사전 정의된 값)
   - 썸네일 (선택, 이미지 파일 < 5MB, 자동 저장소 경로 생성)
   - 파일 목록 (필수, 최소 1개)
     - 파일 경로 (필수)
     - 코드 (필수)
     - 언어 (확장자에서 자동 추론)
3. 폼 제출 시:
   - 검증 통과 후 `/api/templates` 호출
   - 성공 시 → 상세 페이지로 리다이렉트 (`/templates/[id]`)
   - 실패 시 → 에러 메시지 표시, 폼 상태 유지
4. 서버 측 처리:
   - Zod 스키마 검증
   - DB 저장 (templates 테이블, RPC 트랜잭션)
   - 반환값: `{ id }`

---

### 2.2 수정 (Update)

**경로**: `PUT /api/templates/[id]` + UI: `/templates/[id]/edit`

**요구사항**:

1. 관리자만 접근 가능
2. 진입 시 기존 데이터 로드 (폼 초기값 채우기)
3. 수정 가능 항목: 모든 필드 (생성과 동일한 스키마)
4. 파일 목록: 전체 교체 의미론(PUT) — 부분 수정 없음
5. 서버 측 처리:
   - 기존 템플릿 존재 여부 확인 (RLS로 숨겨지면 404)
   - DB 업데이트 (RPC 트랜잭션, 기존 파일 전량 삭제 후 재삽입)
   - 반환값: `{ id }`

---

### 2.3 삭제 (Delete)

**경로**: `DELETE /api/templates/[id]` + UI: 상세 페이지 내 삭제 버튼

**요구사항**:

1. 관리자만 접근 가능
2. UI: 삭제 버튼 클릭 → 확인 다이얼로그 표시
3. 다이얼로그에서 "삭제" 확정 시:
   - 스피너 표시, 버튼 비활성화
   - 서버에 `DELETE` 요청
   - 성공 시 → 목록 페이지로 리다이렉트
   - 실패 시 → 다이얼로그 내부에 에러 메시지 표시(닫지 않음)
4. 서버 측 처리:
   - 템플릿 존재 여부 확인
   - 썸네일 삭제 (Storage에서, 실패해도 무시하고 진행)
   - DB 삭제 (template_files는 cascade)
   - 반환값: `{ success: true }`

---

## 3. TDD 설계 (테스트 우선 구현)

### 3.1 테스트 레이어

| 레이어              | 테스트 유형 | 담당 파일                            |
| ------------------- | ----------- | ------------------------------------ |
| **도메인 모델**     | 유닛        | `model/schema.test.ts`               |
| **API 라우트(BFF)** | 유닛 (모킹) | `app/api/templates/**/route.test.ts` |
| **UI 컴포넌트**     | 유닛 + 통합 | `ui/*.test.tsx`                      |
| **E2E**             | End-to-End  | Playwright (`*.e2e.ts`)              |

### 3.2 도메인 로직 테스트 관점

- 필수 필드 검증 (title, summary, category, files)
- 필드 길이 제한
- 파일 배열: 최소 1개, file_path 중복 금지, 엔트리 파일 규칙(tsx/jsx만, 최대 1개)
- thumbnail_url 형식(상대 경로 또는 http(s) URL)

### 3.3 API 라우트 테스트 관점

- 관리자 권한 확인 (`requireAdmin` 실패 시 즉시 반환, RPC 미호출)
- 요청 바디 스키마 검증 실패 시 400 VALIDATION_ERROR
- 성공 시 201/200 + id 반환
- unique_violation(23505) → 409 CONFLICT
- 기타 DB 에러 → 502 UPSTREAM_ERROR
- PUT에서 RPC가 null 반환(RLS로 숨겨짐/미존재) → 404 NOT_FOUND
- DELETE에서 썸네일 Storage 경로 파싱 성공/실패 분기

### 3.4 UI 컴포넌트 테스트 관점

- `DeleteTemplateDialog`: 다이얼로그 열기, 삭제 확정 시 API 호출과 라우팅, 삭제 중 버튼 비활성화, 실패 시 에러 표시(다이얼로그 유지), 취소 시 닫힘
- `TemplateRegisterForm`/`TemplateEditForm`: 얇은 래퍼이므로 `TemplateForm`을 모킹해 onSubmit 배선(어떤 API를 어떤 인자로 호출하고 어디로 이동하는지)만 검증
- `TemplateForm` 자체의 필드별 상세 동작(파일 추가/삭제, 엔트리 체크 등)은 `TemplateFileFieldArray`가 이미 책임을 분리하고 있어 별도 통합 테스트는 보류

### 3.5 E2E 테스트 관점

Supabase 미설정 환경에서는 관리자 로그인이 불가능하므로, 실제 CRUD 플로우 대신 **권한 가드**만 검증합니다. 상세 내용은 [progress.md](./progress.md) 참고.

이상적인(Supabase 연결 후) E2E 시나리오는 다음과 같습니다:

- 생성: 폼 입력 → 제출 → 상세 페이지 리다이렉트 및 데이터 확인
- 생성: 필수 필드 누락 시 검증 에러 표시
- 수정: 기존 값 프리필 → 필드 변경 → 제출 → 상세 페이지 반영 확인
- 삭제: 확인 다이얼로그 → 삭제 확정 → 목록 페이지 리다이렉트 및 목록에서 제거 확인
- 권한: 비관리자의 `/templates/new`, `/templates/[id]/edit` 접근 시 404, DELETE API 직접 호출 시 403/401

---

## 4. 참고 사항

### 기존 코드 활용

- `schema.ts`: `templateFormSchema`, `createTemplateSchema` 기존 정의 활용
- `test-fixtures.ts`: 테스트용 목 데이터 이미 존재
- `to-form-values.ts`, `to-create-input.ts`: 폼 ↔ API 입력 변환 유틸 기존 구현
- `DeleteTemplateDialog.tsx`, `TemplateForm.tsx`: 이미 구현되어 있었음

### 외부 의존성

- Supabase: 템플릿 저장(RPC 트랜잭션), 썸네일 업로드/삭제(Storage)
- React Hook Form + Zod: `useAppForm` 공통 훅 사용

### 리뷰 지점

- 실제 CRUD 플로우 E2E는 Supabase 연결 및 관리자 계정 준비 후 추가 필요
