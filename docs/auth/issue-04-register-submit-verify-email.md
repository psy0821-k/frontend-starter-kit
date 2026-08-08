# Issue 04 — 회원가입 제출 및 이메일 인증 안내

**상태**: v3 갱신(2026-08-08) — 제출 데이터에서 birthDate 제거, name은 유지. (v2: 제출 데이터에 name/birthDate 포함)
**의존성**: Issue 01(Supabase 서버 클라이언트, 에러 매핑), Issue 02(폼 — 이름/동의 필드 포함), Issue 03(닉네임 확인 — 제출 전 최종 검증에 사용)
**관련 PRD**: [prd.md](./prd.md) §사용자 스토리 1, 6, 7

## 목표

회원가입 폼을 제출하면 Supabase 계정이 생성되고(이름은 `user_metadata`에 함께 저장) 인증 메일이 발송되며, 사용자는 이메일 인증 안내 페이지로 이동한다. 이미 가입된 이메일이면 에러가 안내된다. 이 이슈로 이메일 회원가입 플로우 전체가 처음부터 끝까지 완결된다.

## 작업 범위

- `src/app/api/auth/register/route.ts` — Supabase 서버 SDK로 가입 처리, `options.data`에 `nickname`/`name` 포함(v3: `birthDate` 제거), 이슈 01의 에러 매핑 유틸 사용
- `register-form.tsx`에 제출 핸들러 연결 (성공 시 `/auth/verify-email`로 이동, 실패 시 폼에 에러 메시지 표시) — 기존 구현 완료
- `src/app/auth/verify-email/page.tsx` — 인증 메일 발송 안내만 표시하는 정적 페이지 (기존, 변경 없음)

## Acceptance Criteria

- [ ] Given 유효한 이름/이메일/비밀번호/닉네임을 모두 입력하고 필수 동의를 완료한 상태, When 가입 버튼을 클릭하면, Then Supabase 계정이 생성되고 `/auth/verify-email` 페이지로 이동한다
- [ ] Given `/auth/verify-email` 페이지, When 방문하면, Then 인증 메일을 발송했다는 안내 문구가 보인다
- [ ] Given 이미 가입된 이메일, When 가입 버튼을 클릭하면, Then 페이지 이동 없이 "이미 가입된 이메일입니다" 형태의 에러 메시지가 폼에 표시된다
- [ ] Given 필수 필드(동의 항목 포함) 중 하나라도 비어 있거나 유효하지 않은 상태, When 가입 버튼을 클릭하면, Then 제출되지 않고 해당 필드에 에러가 표시된다

## Definition of Done 체크

- [ ] Supabase 원본 에러가 `ApiError`/`ApiErrorCode`로 매핑되어 프론트엔드에 노출되지 않음
- [ ] 로그에 비밀번호 등 민감정보 출력 없음
