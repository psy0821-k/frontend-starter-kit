# 회원가입(auth/register) 테스트 계획

**작성일**: 2026-08-11
**범위**: `docs/auth/issue-01` ~ `issue-04` (Issue 05는 로그인 페이지로 이관되어 제외)
**상태**: 계획만 정의 — 테스트 도구(Vitest 등) 미설치, 코드 작성은 하지 않음

---

## 0. 전제

- CLAUDE.md 기준 Vitest(유닛)/Playwright(E2E)는 "미설치, 계획 확정" 상태다. 이 문서는 도구 도입 여부와 무관하게 각 이슈의 Acceptance Criteria를 검증 가능한 테스트 케이스로 먼저 정리한다.
- 유닛 테스트 대상은 순수 로직(Zod 스키마, 에러 매핑 유틸, 훅)과 Route Handler로 한정한다. 컴포넌트 상호작용(체크박스 연동, 실시간 표시)은 통합/E2E 성격이 강해 별도 절로 분리했다.
- 각 케이스는 대응하는 이슈 문서의 AC를 그대로 좁혀 작성했다 — 새 요구사항을 추가하지 않는다.

## 1. registerSchema — `src/features/auth/model/schema.ts`

관련: [issue-02](./issue-02-register-form-validation.md)

| #   | Given                                            | When                       | Then                                                             |
| --- | ------------------------------------------------ | -------------------------- | ---------------------------------------------------------------- |
| 1-1 | `name`이 빈 문자열 또는 공백만                   | `registerSchema.safeParse` | 실패, `name` 경로에 에러                                         |
| 1-2 | `password`가 7자 이하                            | parse                      | 실패 ("8자 이상 입력해주세요")                                   |
| 1-3 | `password`에 영문/숫자/특수문자 중 하나라도 없음 | parse                      | 실패 (해당 조건 메시지)                                          |
| 1-4 | `password`와 `passwordConfirm`이 다름            | parse                      | 실패, `passwordConfirm` 경로에 "비밀번호가 일치하지 않습니다"    |
| 1-5 | `nickname`이 2자 미만 또는 20자 초과             | parse                      | 실패                                                             |
| 1-6 | `agreedToTerms: false` (나머지 유효)             | parse                      | 실패, `agreedToTerms` 경로에 에러                                |
| 1-7 | `agreedToPrivacy: false` (나머지 유효)           | parse                      | 실패, `agreedToPrivacy` 경로에 에러                              |
| 1-8 | 모든 필드가 정책을 충족                          | parse                      | 성공, `data`에 `birthDate` 키가 존재하지 않음 (v3에서 삭제 확인) |

## 2. use-nickname-availability 훅 — `src/features/auth/lib/use-nickname-availability.ts`

관련: [issue-03](./issue-03-nickname-availability.md)

| #   | Given                                       | When           | Then                                                     |
| --- | ------------------------------------------- | -------------- | -------------------------------------------------------- |
| 2-1 | 닉네임 입력값이 빈 문자열                   | 훅 렌더        | 상태가 `idle`, API 호출 없음                             |
| 2-2 | 닉네임 입력 후 500ms 경과 전 값이 계속 바뀜 | 여러 번 리렌더 | 마지막 값에 대해서만 `/api/auth/check-nickname` 호출 1회 |
| 2-3 | 디바운스 완료, API 응답 대기 중             | -              | 상태가 `checking`                                        |
| 2-4 | API가 `{ available: true }` 응답            | 응답 수신      | 상태가 `available`                                       |
| 2-5 | API가 `{ available: false }` 응답           | 응답 수신      | 상태가 `unavailable`                                     |
| 2-6 | API 호출 중 컴포넌트 언마운트(cleanup)      | 이후 응답 도착 | 상태 갱신하지 않음(setState 호출 없음)                   |
| 2-7 | API가 `ApiError`를 던짐                     | 응답 수신      | 상태가 `error`, 예외를 상위로 재throw하지 않음           |

## 3. `/api/auth/check-nickname` Route Handler

관련: [issue-03](./issue-03-nickname-availability.md)

| #   | Given                                                      | When      | Then                                                                                             |
| --- | ---------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------ |
| 3-1 | 요청 body의 `nickname`이 `nicknameSchema`에 위배됨(1자 등) | POST 호출 | `400`, `{ success: false, error.code: 'VALIDATION_ERROR' }`                                      |
| 3-2 | `profiles` 테이블에 동일 `nickname` row가 존재             | POST 호출 | `200`, `{ available: false }`                                                                    |
| 3-3 | `profiles` 테이블에 동일 `nickname` row가 없음             | POST 호출 | `200`, `{ available: true }`                                                                     |
| 3-4 | Supabase 조회가 에러 반환                                  | POST 호출 | `500`, `{ error.code: 'INTERNAL_ERROR' }`, Supabase 원본 에러 메시지가 응답 body에 노출되지 않음 |

## 4. `/api/auth/register` Route Handler

관련: [issue-04](./issue-04-register-submit-verify-email.md)

| #   | Given                                                                     | When      | Then                                                               |
| --- | ------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------ |
| 4-1 | 요청 body가 `registerSchema`에 위배됨(필수 필드 누락 등)                  | POST 호출 | `400`, `error.code: 'VALIDATION_ERROR'`, Supabase 호출 없음        |
| 4-2 | 유효한 body, `supabase.auth.signUp`이 성공                                | POST 호출 | `200`, `{ success: true, data: null }`                             |
| 4-3 | 유효한 body, `signUp` 호출 시 `options.data`에 `nickname`/`name`이 전달됨 | POST 호출 | mock 호출 인자 검증 — `birthDate` 키가 포함되지 않음               |
| 4-4 | `supabase.auth.signUp`이 `user_already_exists` 에러 반환                  | POST 호출 | `409`(또는 매핑된 status), `error.code: 'CONFLICT'`                |
| 4-5 | `supabase.auth.signUp`이 매핑 테이블에 없는 에러코드 반환                 | POST 호출 | `500`, `error.code: 'INTERNAL_ERROR'`, 원본 Supabase 메시지 미노출 |

## 5. mapSupabaseAuthError — `src/shared/api/supabase/map-error.ts`

관련: [issue-01](./issue-01-supabase-setup.md)

| #   | Given                                  | When      | Then                                        |
| --- | -------------------------------------- | --------- | ------------------------------------------- |
| 5-1 | `error.code === 'user_already_exists'` | 매핑 호출 | `ApiErrorCode.CONFLICT`                     |
| 5-2 | `error.code === 'email_exists'`        | 매핑 호출 | `ApiErrorCode.CONFLICT`                     |
| 5-3 | `error.code === 'weak_password'`       | 매핑 호출 | `ApiErrorCode.VALIDATION_ERROR`             |
| 5-4 | `error.code === 'invalid_credentials'` | 매핑 호출 | `ApiErrorCode.INVALID_CREDENTIALS`          |
| 5-5 | `error.code === 'email_not_confirmed'` | 매핑 호출 | `ApiErrorCode.EMAIL_NOT_VERIFIED`           |
| 5-6 | 매핑 테이블에 없는 임의의 `error.code` | 매핑 호출 | `ApiErrorCode.INTERNAL_ERROR`, status `500` |

## 6. 환경변수 검증 — `src/shared/config/env.ts`

관련: [issue-01](./issue-01-supabase-setup.md)

| #   | Given                                              | When      | Then                                                |
| --- | -------------------------------------------------- | --------- | --------------------------------------------------- |
| 6-1 | `NEXT_PUBLIC_SUPABASE_URL`이 URL 형식이 아님       | 모듈 로드 | `ZodError` throw, 콘솔에 누락/오류 필드 경로 출력   |
| 6-2 | 두 Supabase 환경변수가 유효하거나 미설정(optional) | 모듈 로드 | 정상 로드, `env.NEXT_PUBLIC_SUPABASE_URL` 접근 가능 |

> 주의: PRD §Definition of Done은 "환경변수 누락 시 부팅 실패"를 요구하지만 현재 `env.ts` 구현은 두 키를 `optional()`로 두고 있다(Supabase 미연결 상태에서도 부팅 가능하도록 하는 의도적 결정, 코드 주석 참조). 6-1/6-2는 **현재 구현 기준**이며, PRD의 "필수 환경변수" 요구가 유효한지는 이 문서 범위를 벗어난 별도 확인이 필요하다.

## 7. 컴포넌트 상호작용 (통합/E2E 성격 — Playwright 권장)

관련: [issue-02](./issue-02-register-form-validation.md), [issue-04](./issue-04-register-submit-verify-email.md)

유닛 테스트보다 실제 DOM 렌더링·타이핑 이벤트 검증이 필요해 별도로 분리했다. Vitest + Testing Library로도 가능하나, 폼 전체 플로우이므로 Playwright E2E를 권장한다.

| #   | Given                                          | When                    | Then                                                                             |
| --- | ---------------------------------------------- | ----------------------- | -------------------------------------------------------------------------------- |
| 7-1 | `/auth/register` 방문                          | 페이지 로드             | 이름 필드가 이메일 필드보다 DOM 순서상 앞에 위치, Google 버튼·생년월일 필드 없음 |
| 7-2 | 비밀번호 필드에 8자 미만 값 입력               | 타이핑 중(각 keystroke) | 미충족 조건이 체크리스트에 즉시 반영                                             |
| 7-3 | 비밀번호와 확인 필드 값이 다름                 | 타이핑 중               | 불일치 안내가 즉시 표시                                                          |
| 7-4 | 이용약관·개인정보처리방침 체크박스를 각각 클릭 | 두 번째 체크 완료 시점  | 전체 동의 체크박스가 자동으로 체크됨                                             |
| 7-5 | 전체 동의 체크박스 클릭                        | 클릭 즉시               | 이용약관·개인정보처리방침 체크박스 모두 체크됨                                   |
| 7-6 | 필수 동의 중 하나 미체크                       | 가입 버튼 클릭          | 폼 제출 안 됨, 해당 항목에 에러 표시                                             |
| 7-7 | 모든 필드 유효 + 필수 동의 완료                | 가입 버튼 클릭          | `/auth/verify-email`로 이동                                                      |
| 7-8 | 이미 가입된 이메일로 제출                      | 가입 버튼 클릭          | 페이지 이동 없음, 폼에 "이미 가입된 이메일입니다" 에러 표시                      |
| 7-9 | `/auth/verify-email` 방문                      | 페이지 로드             | 인증 메일 발송 안내 문구 표시                                                    |

## 8. 커버되지 않는 것 (Out of Scope)

- Issue 05(Google OAuth)는 로그인 페이지로 이관되어 이 문서에서 제외한다.
- 약관/개인정보처리방침 본문 검증 — 자리표시자 페이지이므로 텍스트 내용은 테스트하지 않는다.
- 비밀번호 정책의 정확한 정규식 경계값(예: 유니코드 특수문자) 전수 테스트 — 정책 자체가 구현 중 확정 예정이므로 이번 계획에서는 대표 케이스만 다룬다.

## 9. 다음 단계 (승인 후 진행, 이 문서 범위 아님)

- Vitest + Testing Library(+ jsdom) 설치 여부 결정
- Playwright 설치 및 `/auth/register` 대상 E2E 시나리오 구현
- 위 표의 각 행을 `it()`/`test()` 케이스로 전환
