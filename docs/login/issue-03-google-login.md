# Issue 03 — Google 간편 로그인 배치 및 콜백 리다이렉트 조정

**의존성**: Issue 01(로그인 폼 — 버튼을 배치할 페이지)
**관련 PRD**: [prd.md](./prd.md) §기술 결정 "Google OAuth 콜백 — 리다이렉트 대상을 쿼리 파라미터 대신 고정 경로로 분리"

## 목표

`/auth/login`에 기존 `GoogleAuthButton`(회원가입에서 이관된 컴포넌트, 수정 없이 재사용)을 배치하고, OAuth 콜백(`/api/auth/callback`)이 실패 시 `/auth/register`가 아닌 `/auth/login`으로 리다이렉트하도록 조정한다. 이 이슈로 Google 로그인 진입점과 실패 시 복귀 경로까지 완결된다.

## 작업 범위

- `src/app/auth/login/page.tsx` — `GoogleAuthButton` 배치 (컴포넌트 자체는 수정 없음)
- `src/app/api/auth/callback/route.ts` — 실패 시 리다이렉트 대상을 `/auth/register?error=oauth_failed`에서 `/auth/login?error=oauth_failed`로 변경, 성공 시 리다이렉트는 `origin`(홈) 유지

## Acceptance Criteria

- [ ] Given `/auth/login` 페이지, When 방문하면, Then "Google로 계속하기" 버튼이 보인다
- [ ] Given Google 인증 도중 실패(콜백에 `code`가 없거나 `exchangeCodeForSession`이 에러를 반환), When 콜백이 처리되면, Then `/auth/login?error=oauth_failed`로 리다이렉트된다(기존처럼 `/auth/register`가 아님)
- [ ] Given Google 인증 성공, When 콜백이 처리되면, Then 홈(`/`)으로 리다이렉트된다
- [ ] Given "Google로 계속하기" 버튼 클릭, When 클릭 시점, Then 실제 리다이렉트는 발생하지 않는다(`isSupabaseConnected` 가드 — Supabase 미연결 상태, 기존 구현 그대로)

## Definition of Done 체크

- [ ] Google OAuth Client Secret이 애플리케이션 코드/환경변수에 존재하지 않음(기존 정책 유지)
- [ ] `/auth/register` 페이지에서도 여전히 정상 동작하는지 회귀 확인(콜백 공유 대상이므로 회원가입 쪽 회귀는 없음 — 애초에 회원가입에서는 버튼이 이미 제거되어 있음)
