# Issue 05 — Google 간편 가입(OAuth)

**상태**: 범위 변경 — Google 버튼은 회원가입 페이지에서 제거되어 `/auth/login`으로 이관 예정 (2026-08-08). 관련 코드(`google-auth-button.tsx`, `/api/auth/callback`)는 삭제하지 않고 보존, 로그인 페이지 작업 시 재사용한다. 아래 내용은 이관 전 원래 스코프의 기록이며, 실제 배치는 로그인 페이지 spec/PRD에서 다시 정의한다.

**의존성**: Issue 01(Supabase 서버 클라이언트, 에러 매핑)
**관련 PRD**: [prd.md](./prd.md) §사용자 스토리 7, §Security Impact(Google OAuth Client는 Supabase 대시보드에 등록) — 이관에 따라 PRD도 갱신 필요

## 목표

"Google로 계속하기" 버튼으로 비밀번호 입력 없이 즉시 가입/로그인한다. 닉네임은 Google 프로필 이름으로 자동 지정된다.

## 작업 범위

- Supabase Auth Provider 설정에 Google OAuth Client ID/Secret 등록 (Supabase 대시보드 작업, 코드에는 Secret 미보관)
- `src/features/auth/ui/google-auth-button.tsx` — 클라이언트, `signInWithOAuth` 트리거 (구현 완료, 배치 위치만 로그인 페이지로 변경 예정)
- `src/app/api/auth/callback/route.ts` — Supabase OAuth 콜백 처리, 세션 쿠키 설정, Google 프로필 이름을 닉네임으로 저장 (구현 완료)
- ~~`register-form.tsx`가 있는 페이지에 버튼 배치~~ → `/auth/login` 페이지에 배치 (별도 spec/PRD)

## Acceptance Criteria

- [x] ~~Given `/auth/register` 페이지, When 방문하면, Then "Google로 계속하기" 버튼이 보인다~~ → 회원가입 페이지에서 제거됨
- [ ] Given `/auth/login` 페이지, When 방문하면, Then "Google로 계속하기" 버튼이 보인다 (로그인 페이지 작업 시 재확인)
- [ ] Given "Google로 계속하기" 버튼, When 클릭하고 Google 인증을 완료하면, Then 별도 이메일 인증 절차 없이 즉시 로그인 상태가 된다
- [ ] Given Google 인증이 완료된 상태, When 가입이 완료되면, Then 닉네임이 Google 프로필 이름으로 자동 지정되어 있다
- [ ] Given Google 인증 도중 사용자가 취소하거나 실패하면, When 콜백이 처리되면, Then 로그인 페이지로 돌아와 에러가 안내된다

## Definition of Done 체크

- [ ] Google OAuth Client Secret이 애플리케이션 코드/환경변수에 존재하지 않음 (Supabase 대시보드에만 등록)
- [ ] Supabase 원본 에러가 `ApiError`/`ApiErrorCode`로 매핑됨
