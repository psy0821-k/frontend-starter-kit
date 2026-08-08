# Issue 02 — 이메일 미인증 로그인 차단

**의존성**: Issue 01(로그인 폼)
**관련 PRD**: [prd.md](./prd.md) §기술 결정 "이메일 미인증 로그인 차단 — 신규 에러 코드 EMAIL_NOT_VERIFIED 추가"

## 목표

이메일/비밀번호는 맞지만 이메일 인증을 완료하지 않은 계정이 로그인을 시도하면, 에러 메시지 대신 `/auth/verify-email`로 이동해 재안내를 받는다. 이 이슈만으로 "로그인 시도 → 미인증 감지 → 안내 페이지 이동"이라는 완결된 사용자 관찰 가능 동작이 생긴다.

## 작업 범위

- `src/types/api.ts` — `ApiErrorCode` 유니온에 `EMAIL_NOT_VERIFIED` 추가
- `src/shared/api/supabase/map-error.ts` — 매핑 테이블에 `email_not_confirmed → EMAIL_NOT_VERIFIED` 추가
- `login-form.tsx` — `ApiErrorCode === 'EMAIL_NOT_VERIFIED'`일 때 에러 메시지를 표시하는 대신 `router.push('/auth/verify-email')` 실행

## Acceptance Criteria

- [ ] Given 이메일/비밀번호는 올바르지만 이메일 인증이 완료되지 않은 계정, When 로그인을 시도하면(Supabase가 `email_not_confirmed`를 반환하는 상황), Then 로그인 폼에 에러 메시지가 표시되는 대신 `/auth/verify-email` 페이지로 이동한다
- [ ] Given `EMAIL_NOT_VERIFIED`와 `INVALID_CREDENTIALS` 두 에러 코드, When 각각 발생하면, Then 서로 다른 화면 동작(페이지 이동 vs 폼 내 에러 메시지)으로 명확히 구분된다

## Definition of Done 체크

- [ ] `ApiErrorCode` 유니온에 코드 추가만으로 처리됨 — 기존 exhaustive switch 등 다른 코드 영향 없음 확인
- [ ] Supabase 원본 에러 코드(`email_not_confirmed`)가 프론트엔드에 그대로 노출되지 않음(매핑된 `EMAIL_NOT_VERIFIED`만 사용)
