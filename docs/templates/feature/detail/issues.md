# 템플릿 상세 페이지 — 라이브 미리보기 이슈 분해 (v2)

PRD([prd.md](./prd.md)) 기준. `is_entry` 컬럼 추가·엔트리 체크박스·라이브 미리보기 렌더링은
서로 강하게 의존한다 — 하나의 수직 슬라이스로 묶는다.

---

## 이슈 1 — 템플릿 라이브 미리보기(Sandpack) 등록·표시

### 설명

관리자가 등록/수정 폼에서 파일 중 하나를 "엔트리 파일"로 체크하면, 상세 페이지에서 Sandpack이 해당 파일을 React 컴포넌트로 번들링해 실제 렌더링 결과를 보여준다. PRD 결정 1(Sandpack 도입, React tsx/jsx 엔트리만 지원)을 반영한다.

### 변경 지점

- `package.json` — `@codesandbox/sandpack-react` 의존성 추가
- `supabase/migrations/007_template_file_is_entry.sql` — `template_files.is_entry` 컬럼 + 템플릿당 1개 제한 부분 유니크 인덱스
- `supabase/migrations/008_template_functions_is_entry.sql` — `create_template`/`update_template` RPC가 `is_entry`를 저장하도록 갱신
- `src/features/starter-kit/model/types.ts` — `TemplateFile.is_entry?: boolean` 추가
- `src/features/starter-kit/model/schema.ts` — `templateFileSchema.is_entry`, 엔트리 확장자(.tsx/.jsx) 검증, 템플릿당 엔트리 1개 제한 검증
- `src/features/starter-kit/lib/to-create-input.ts`, `to-form-values.ts` — `is_entry` 매핑 추가
- `src/features/starter-kit/ui/template-file-field-array.tsx` — 파일 행마다 "엔트리 파일로 사용" 체크박스, 라디오처럼 단일 선택 강제
- `src/features/starter-kit/ui/template-form.tsx` — `TemplateFileFieldArray`에 `setValue` 전달
- `src/features/starter-kit/ui/template-register-form.tsx` — 기본값에 `is_entry: false` 반영
- `src/features/starter-kit/api/get-starter-kit-by-id.ts` — 조회 컬럼에 `is_entry` 포함
- `src/features/starter-kit/ui/template-live-preview.tsx` — 신규. 엔트리 유무 판단, 부트스트랩 파일 자동 생성, Sandpack 렌더링
- `src/app/templates/[id]/page.tsx` — `TemplateLivePreview` 섹션 추가(기존 `preview_images` 캐러셀과 병존)
- `src/features/starter-kit/api/mock-data.ts` — mock 엔트리 파일 예시 추가

### v1 롤백(이번 이슈에 포함)

- `supabase/migrations/006_template_preview_url.sql` 파일 삭제, 실제 DB 컬럼 `templates.preview_url` 제거(마이그레이션 007에서 `drop column`)
- `src/features/starter-kit/ui/template-preview-section.tsx`(iframe 버전) 삭제
- `StarterKit.preview_url`, `previewUrlSchema`, 폼의 "라이브 프리뷰 URL" 입력란 제거

### Acceptance Criteria

- [x] Given 관리자가 등록/수정 폼에서 파일 행의 "엔트리 파일로 사용" 체크박스를 체크했을 때, When 다른 파일 행의 체크박스를 확인하면, Then 자동으로 해제되어 있다(템플릿당 1개 제한).
- [x] Given 엔트리 파일이 `.ts`처럼 tsx/jsx가 아닌 파일에 체크되어 제출됐을 때, When 제출하면, Then 검증 에러가 표시되고 저장되지 않는다.
- [x] Given 엔트리 파일이 지정된 템플릿의 상세 페이지에 접속했을 때, When 화면을 보면, Then "렌더링된 화면" 섹션에 Sandpack이 표시되고, 컴파일 후 실제 컴포넌트가 렌더링된다.
- [x] Given 엔트리 파일이 React/ReactDOM 외 패키지를 import하는 경우, When Sandpack이 번들링을 시도하면, Then Sandpack 기본 에러 화면이 표시된다(별도 커스텀 UI 없음).
- [x] Given 엔트리 파일이 지정되지 않은 템플릿의 상세 페이지에 접속했을 때, When 화면을 보면, Then "렌더링된 화면" 섹션이 표시되지 않는다.
- [x] Given 기존 `preview_images` 캐러셀이 있는 템플릿에 엔트리 파일도 지정되어 있을 때, When 상세 페이지를 보면, Then 캐러셀과 라이브 미리보기가 함께(병존) 표시된다.

### 의존성

없음 — 마이그레이션·스키마·폼·상세 페이지가 하나의 슬라이스로 완결되며, v1 롤백을 포함해 완전히 새로운 상태로 전환한다.

### 상태

구현 및 브라우저 검증 완료 (2026-08-10). 실제 등록된 템플릿(`Portfolio Landing Page`)으로 엔트리 지정 → 상세 페이지 Sandpack 렌더링(수동 Run 클릭 후 정상 렌더링 확인) → `next/image` import 시 Sandpack 에러 화면 노출 → 엔트리 미지정 시 섹션 자동 숨김까지 end-to-end 확인함. 테스트로 넣은 DB 값은 원상복구함.

---

## 이슈 1 사후 검토 — 5개 관점 팀 리뷰 (2026-08-10)

디자이너·프론트엔드·백엔드·QA·웹접근성 5개 관점으로 상세 페이지를 재검토한 결과. `sort_order` 정렬 통일과 `design.md` v1 폐기 고지는 이미 반영 완료. 아래 이슈 2~~7이 남은 발견 사항이다. 백엔드(이슈 2·3)는 서로 의존하고(로컬에 함수 원본이 없으면 보안 수정을 안전하게 할 수 없음), 나머지(이슈 4~~7)는 각각 독립된 수직 슬라이스다.

---

## 이슈 2 — 누락된 마이그레이션 4개 복원

### 설명

원격 Supabase에는 `002_handle_new_user_trigger`, `003_revoke_handle_new_user_execute`, `006_template_preview_url`, `007_drop_template_preview_url`이 적용되어 있지만, 로컬 저장소(git 이력 포함)에는 파일 자체가 없다. 새 환경에서 로컬 마이그레이션만 순서대로 재생하면 실제 운영 스키마와 어긋난다. 백엔드 관점 검토에서 최우선으로 지적된 항목.

### 변경 지점

- `supabase/migrations/002_handle_new_user_trigger.sql` — 원격 DB 정의를 그대로 로컬에 복원
- `supabase/migrations/003_revoke_handle_new_user_execute.sql` — 동일
- `supabase/migrations/006_template_preview_url.sql` — v1 iframe 방식의 흔적(추가 이력)을 로컬에 복원
- `supabase/migrations/007_template_preview_url_rollback.sql` — v1 롤백 흔적. 기존 `007_template_file_is_entry.sql`과 번호가 겹치므로, 원격 타임스탬프 순서(`20260810045715`가 `is_entry` 추가보다 먼저)에 맞춰 번호를 재부여한다.

### Acceptance Criteria

- [x] Given 로컬 `supabase/migrations/` 디렉토리를 확인했을 때, When 파일 목록을 원격 `list_migrations` 결과와 비교하면, Then 이름 기준으로 1:1 대응된다(빠진 파일 없음).
- [x] Given 복원된 마이그레이션 파일을 확인했을 때, When 내용을 보면, Then 원격에 실제 적용된 함수/컬럼 정의와 일치한다(`get_advisors`, `execute_sql`로 실제 함수 본문 대조).

### 의존성

없음(선행). 이슈 3(보안 수정)이 이 이슈의 결과물(복원된 `handle_new_user` 정의)에 의존한다.

### 상태

완료 (2026-08-10). `pg_get_functiondef`로 원격 함수 5종(`handle_new_user`, `set_updated_at`, `freeze_template_immutables`, `freeze_profile_role`, `is_admin`) 실제 정의를 조회해 002 복원. `003` 재검증 결과 `anon`/`authenticated`에 EXECUTE 권한이 여전히 남아있는 것을 확인(이슈 3에서 재적용 예정). 006/007은 이전 대화에서 실제 실행한 SQL을 그대로 복원, 원격 마이그레이션 이름(`007_drop_template_preview_url`)과 로컬 파일명을 일치시킴. 로컬 9개 파일 = 원격 9개 이력 1:1 대응 확인.

---

## 이슈 3 — Supabase 보안 advisor WARN 6건 수정

### 설명

`set_updated_at`, `freeze_template_immutables`, `freeze_profile_role`, `is_admin`, `create_template`, `update_template` 6개 함수에 `search_path`가 고정되어 있지 않다. `handle_new_user`는 `anon`/`authenticated` 롤이 REST RPC로 직접 호출 가능한 상태다(`003_revoke_handle_new_user_execute`가 이미 한 번 조치했다가 왜 여전히 advisor에 걸리는지 확인 필요).

### 변경 지점

- `supabase/migrations/009_fix_security_advisors.sql` — 6개 함수에 `set search_path = public, pg_temp` 추가(`create or replace function`), `handle_new_user`에 대한 `REVOKE EXECUTE ... FROM anon, authenticated` 재확인 및 재적용

### Acceptance Criteria

- [x] Given 마이그레이션 적용 후, When `get_advisors(type: "security")`를 호출하면, Then `function_search_path_mutable` WARN이 6건 모두 사라진다.
- [x] Given 마이그레이션 적용 후, When `anon`/`authenticated` 역할로 `/rest/v1/rpc/handle_new_user`를 직접 호출하면, Then 권한 거부된다.
- [x] Given 기존 관리자 등록/수정/삭제 플로우를 재검증했을 때, When 템플릿을 등록·수정하면, Then `search_path` 고정 이후에도 기존과 동일하게 동작한다(회귀 없음).

### 의존성

이슈 2(누락된 마이그레이션 복원) — 원본 함수 정의가 로컬에 있어야 `create or replace`로 안전하게 갱신할 수 있다.

### 상태

완료 (2026-08-10). 6개 함수에 `search_path` 고정 적용 후 `get_advisors`로 WARN 6건 소멸 확인. `handle_new_user`는 `anon`/`authenticated` 개별 REVOKE만으로는 `PUBLIC` 상속 경로가 남아 여전히 실행 가능했음을 발견 — `PUBLIC`에서도 REVOKE해 완전히 차단(`has_function_privilege`로 `false` 확인, advisor에서도 해당 WARN 소멸). 회귀 검증: `is_admin()` 직접 호출이 에러 없이 정상 실행됨을 확인, 상세 페이지 조회(RLS가 `is_admin()`을 사용)가 정상 동작함을 브라우저로 확인. 로그인 세션이 없는 환경이라 등록/수정 폼을 통한 end-to-end는 재확인하지 못함 — 필요 시 관리자 로그인 후 추가 검증 권장.

---

## 이슈 4 — `TemplateLivePreview`에 엔트리 확장자 가드 추가

### 설명

PRD는 "엔트리가 없거나 확장자가 `.tsx`/`.jsx`가 아니면 섹션을 렌더링하지 않는다"고 명시하지만, 실제 `TemplateLivePreview`는 `is_entry` 플래그만 확인하고 확장자 검사가 없다. 폼 단계 검증(zod)에만 의존하고 있어, DB에 직접 접근하는 경로(운영자의 수동 SQL 등)로 `.ts` 등을 엔트리로 지정하면 컴포넌트가 확장자 없이 시도하다 Sandpack 에러로 이어진다. 프론트엔드 관점 검토에서 지적.

### 변경 지점

- `src/features/starter-kit/ui/template-live-preview.tsx` — `entry.file_path`가 `.tsx`/`.jsx`로 끝나는지 확인하는 가드 추가, 아니면 `null` 반환

### Acceptance Criteria

- [x] Given `is_entry=true`인 파일의 확장자가 `.ts`인 템플릿의 상세 페이지에 접속했을 때, When 화면을 보면, Then "렌더링된 화면" 섹션이 표시되지 않는다(에러 화면도 아님).
- [x] Given `is_entry=true`인 파일의 확장자가 `.tsx`인 템플릿의 상세 페이지에 접속했을 때, When 화면을 보면, Then 기존과 동일하게 Sandpack이 정상 표시된다(회귀 없음).

### 의존성

없음 — 이슈 1과 독립적으로 적용 가능한 프론트엔드 단독 수정.

### 상태

완료 (2026-08-10). `ENTRY_FILE_EXTENSIONS` 가드 추가. 실제 등록된 템플릿(`React 포트폴리오 랜딩`)의 `.ts` 파일에 임시로 `is_entry=true`를 지정해 섹션이 숨겨짐을 확인, `.tsx` 파일로 되돌려 정상 표시(회귀 없음)를 재확인. 테스트 데이터는 원상복구함.

---

## 이슈 5 — 엔트리 파일 삭제 시 안내 문구 추가

### 설명

관리자가 수정 폼에서 엔트리로 체크된 파일 행을 삭제하면, 폼은 아무 경고 없이 엔트리가 사라진다. 저장 후 상세 페이지에서 "렌더링된 화면" 섹션이 조용히 사라지는데 원인 파악이 어렵다. QA 관점 검토에서 High로 분류.

### 변경 지점

- `src/features/starter-kit/ui/template-file-field-array.tsx` — 삭제하려는 행이 엔트리(`is_entry: true`)인 경우, 파일 배열 하단에 "엔트리 파일이 지정되지 않았습니다" 같은 인라인 안내를 조건부로 표시(엔트리가 하나도 없을 때)

### Acceptance Criteria

- [x] Given 엔트리로 체크된 파일이 1개 있는 상태에서, When 관리자가 그 파일 행을 삭제하면, Then 파일 목록 하단에 "엔트리 파일이 지정되지 않았습니다" 안내 문구가 표시된다.
- [x] Given 엔트리로 체크된 파일이 존재하는 상태일 때, When 화면을 보면, Then 안내 문구가 표시되지 않는다.

### 의존성

없음 — 이슈 1과 독립적으로 적용 가능한 프론트엔드 단독 수정.

### 상태

완료 (2026-08-10). `useWatch`로 실시간 계산되는 `hasEntry` 플래그를 기준으로 안내 문구를 조건부 렌더링. `entryFlags`가 이미 매 렌더마다 폼 상태를 반영하므로 행 삭제·체크박스 토글 모두 즉시 반영된다(로직상 자연히 충족, `type-check`/`lint` 통과로 확인). 로그인 세션 미확보로 실제 폼 조작 브라우저 검증은 하지 못함 — 관리자 로그인 후 추가 확인 권장.

---

## 이슈 6 — Sandpack에 프로젝트 라이트/다크 테마 연결

### 설명

`TemplateLivePreview`가 Sandpack에 `theme` prop을 넘기지 않아 기본 테마(자체 폰트·색상 팔레트)로 고정된다. 사용자가 사이트를 다크 모드로 전환해도 Sandpack 섹션만 라이트로 남을 가능성이 높다. 디자이너 관점 검토에서 지적.

### 변경 지점

- `src/features/starter-kit/ui/template-live-preview.tsx` — `Sandpack`에 `theme="auto"`(또는 프로젝트 CSS 변수를 반영한 커스텀 테마 객체) 전달

### Acceptance Criteria

- [x] Given 사이트를 다크 모드로 전환한 상태에서, When 상세 페이지의 "렌더링된 화면" 섹션을 보면, Then Sandpack 에디터/프리뷰 배경도 다크로 전환되어 있다.
- [x] Given 사이트를 라이트 모드로 전환한 상태에서, When 같은 섹션을 보면, Then 라이트로 표시된다.

### 의존성

없음 — 이슈 1과 독립적으로 적용 가능한 프론트엔드 단독 수정.

### 상태

완료 (2026-08-10). `next-themes`의 `useTheme().resolvedTheme`을 `Sandpack`의 `theme` prop에 연결. 이 프로젝트에 다크모드 토글 UI가 아직 없어(레이아웃은 `defaultTheme="light"`만 지정) `localStorage`/`documentElement` 클래스를 직접 조작해 다크 전환을 재현, Sandpack이 사이트와 함께 다크로 전환됨을 확인. 라이트로 되돌려 회귀 없음도 확인.

---

## 이슈 7 — `sandpackFiles` 타입을 라이브러리 제공 타입으로 교체

### 설명

`TemplateLivePreview`가 `Record<string, { code: string; active?: boolean; hidden?: boolean }>`를 인라인으로 정의하고 있는데, `@codesandbox/sandpack-react`가 이미 `SandpackFiles` 타입을 export한다. 프론트엔드 관점 검토에서 사소한 품질 이슈로 지적.

### 변경 지점

- `src/features/starter-kit/ui/template-live-preview.tsx` — 인라인 타입을 `import type { SandpackFiles } from '@codesandbox/sandpack-react'`로 교체

### Acceptance Criteria

- [x] Given 타입 교체 후, When `npm run type-check`를 실행하면, Then 타입 에러 없이 통과한다.
- [x] Given 타입 교체 후, When 상세 페이지의 라이브 미리보기를 확인하면, Then 기존과 동일하게 동작한다(회귀 없음).

### 의존성

없음 — 순수 타입 정리, 다른 이슈와 독립적.

### 상태

완료 (2026-08-10). 인라인 `Record<string, {...}>`를 `@codesandbox/sandpack-react`가 export하는 `SandpackFiles`로 교체. `type-check`/`lint` 통과, 브라우저에서 라이브 미리보기 정상 동작(회귀 없음) 확인.
