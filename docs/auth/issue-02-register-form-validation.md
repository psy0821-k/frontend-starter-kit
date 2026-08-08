# Issue 02 — 회원가입 폼 UI 및 실시간 검증

**상태**: v3 갱신(2026-08-08) — 이름 필드를 폼 최상단으로 이동, 생년월일 필드 삭제. (v2: 이름·개인정보 동의 필드 추가, Google 버튼 제거)
**의존성**: Issue 01 (환경변수·클라이언트 자체는 필요 없지만, 프로젝트 전체가 부팅 가능한 상태여야 함)
**관련 PRD**: [prd.md](./prd.md) §기술 결정 "폼 검증 모드", "폼 boolean 필드의 defaultValues 필수", "개인정보 동의 — Zod boolean + refine(true), 전체 동의는 파생 상태"

## 목표

`/auth/register` 페이지에서 이름(최상단)·이메일·비밀번호·비밀번호 확인·닉네임을 입력하고, 이용약관/개인정보처리방침에 동의한다. 비밀번호 조건 충족 여부와 비밀번호 확인 일치 여부는 타이핑 중 실시간으로 확인할 수 있다. 이 이슈는 제출(백엔드 연동) 없이 클라이언트 검증까지만 다루지만, 사용자가 실제로 상호작용하며 확인 가능한 화면 동작을 제공한다.

## 작업 범위

- `src/shared/lib/hooks/use-app-form.ts` — `mode`, `defaultValues` 옵션 파라미터 추가 (완료)
- `src/features/auth/model/schema.ts` — `registerSchema`에 `name`(공백 아님), `agreedToTerms`/`agreedToPrivacy`(`boolean` + `refine(true)`) 포함. `birthDateSchema`는 v3에서 삭제(완료)
- `src/app/auth/register/page.tsx` — Google 버튼 제거(완료), 서버 컴포넌트 셸 유지
- `src/features/auth/ui/register-form.tsx` — 이름 필드를 폼 최상단(이메일보다 먼저)에 배치(완료), 생년월일 필드 삭제(완료), 동의 체크박스 필드 포함, `defaultValues`에 모든 필드 초기값 명시
- `src/features/auth/ui/consent-checkbox-group.tsx` — 전체 동의(파생 상태) + 이용약관/개인정보처리방침 개별 체크박스, `/legal/terms`·`/legal/privacy` 링크 (완료)
- `src/components/ui/checkbox.tsx` — shadcn 설치(완료)
- `src/app/legal/terms/page.tsx`, `src/app/legal/privacy/page.tsx` — 자리표시자 페이지 (완료)
- `src/features/auth/ui/password-requirement-list.tsx` — 기존 구현 유지, 변경 없음

## Acceptance Criteria

- [x] Given `/auth/register` 페이지, When 방문하면, Then 이름 필드가 폼 최상단(이메일보다 위)에 보인다 (Google 버튼, 생년월일 필드는 보이지 않는다)
- [x] Given 비밀번호 입력 필드, When 8자 미만 또는 영문/숫자/특수문자 중 하나라도 빠진 값을 입력하면, Then 타이핑하는 즉시 미충족 조건이 표시된다
- [x] Given 비밀번호와 비밀번호 확인이 일치하지 않는 상태, When 확인하면, Then 타이핑하는 즉시 불일치 안내가 표시된다
- [x] Given 이용약관과 개인정보처리방침 체크박스를 각각 체크하면, When 두 체크박스가 모두 선택되면, Then 전체 동의 체크박스도 자동으로 선택 상태가 된다
- [x] Given 전체 동의 체크박스를 클릭하면, When 클릭 즉시, Then 이용약관·개인정보처리방침 체크박스가 모두 선택된다 (defaultValues 수정으로 버그 해결 확인됨)
- [x] Given 이용약관 또는 개인정보처리방침 중 하나라도 미동의 상태, When 가입 버튼을 클릭하면, Then 제출되지 않고 해당 동의 항목에 에러가 표시된다
- [x] Given 이름 필드가 빈 값이거나 공백만 있는 상태, When 가입 버튼을 클릭하면, Then 제출되지 않고 이름 필드에 에러가 표시된다

## Definition of Done 체크

- [x] 신규 환경변수 없음 — 해당 없음
- [x] 이름 등 신규 개인정보 수집 항목이 §Security Impact(v2)에 반영되어 있음 (v3: 생년월일 제외 반영)
