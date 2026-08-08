# 로그인(auth/login) PRD

**작성일**: 2026-08-09
**상태**: 요구사항·기술 결정 확정, 구현 전 단계

원본: [spec-fixed.md](./spec-fixed.md)

---

## 개요

`/auth/login`은 [docs/routing.md](../routing.md)에 정의된 인증 전용 독립 영역(`auth`)의 로그인 페이지다. 이메일/비밀번호 로그인과 Google OAuth 간편 로그인을 제공한다. Google OAuth는 회원가입 페이지에서 이관된 기존 컴포넌트(`GoogleAuthButton`)를 그대로 재사용하고, `/api/auth/callback`의 리다이렉트 대상만 로그인 스코프에 맞게 조정한다. 로그인 실패는 이메일 미가입/비밀번호 오류를 구분하지 않는 통일 메시지로 안내하되, 이메일 미인증 상태만 예외적으로 `/auth/verify-email`로 안내한다.

## 사용자 스토리

1. 방문자는 이메일과 비밀번호를 입력해 로그인할 수 있다.
2. 방문자는 "Google로 계속하기" 버튼으로 즉시 로그인할 수 있다.
3. 방문자는 이메일 또는 비밀번호가 틀리면 어느 쪽이 틀렸는지 구분되지 않는 통일된 에러 메시지를 본다.
4. 방문자는 이메일 인증을 완료하지 않은 계정으로 로그인을 시도하면 차단되고 `/auth/verify-email`로 이동해 재안내를 받는다.
5. 방문자는 로그인 성공 시 홈(`/`)으로 이동한다.
6. 방문자는 "비밀번호를 잊으셨나요?" 링크와 "회원가입" 링크를 로그인 폼에서 확인할 수 있다.

## 구현 계획

| 영역                  | 구현 위치                                     | 비고                                                                                       |
| --------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 라우트                | `src/app/auth/login/page.tsx`                 | 서버 컴포넌트 셸, 폼은 클라이언트 컴포넌트 위임                                            |
| 로그인 폼             | `src/features/auth/ui/login-form.tsx`         | 클라이언트, `useAppForm(loginSchema)` — mode 생략(onBlur 기본값)                           |
| Zod 스키마            | `src/features/auth/model/schema.ts`           | `loginSchema`(이메일/비밀번호, 형식 검증만 — 실제 자격 증명 확인은 서버) 추가              |
| BFF 로그인            | `src/app/api/auth/login/route.ts`             | Supabase 서버 SDK로 로그인 처리, `mapSupabaseAuthError` 재사용해 에러 매핑                 |
| BFF Google OAuth 콜백 | `src/app/api/auth/callback/route.ts`          | 기존 파일 수정 — 리다이렉트 대상을 회원가입 전용에서 공용으로 조정(§기술 결정 참조)        |
| Google 로그인 버튼    | `src/features/auth/ui/google-auth-button.tsx` | 기존 컴포넌트 그대로 재사용, 수정 없음                                                     |
| 에러 코드             | `src/types/api.ts`                            | 기존 `INVALID_CREDENTIALS`(통일 메시지용), 이메일 미인증은 신규 코드 필요(§기술 결정 참조) |
| 링크                  | `login-form.tsx` 내부                         | `/auth/forgot-password`(미구현 페이지로 연결), `/auth/register`                            |

**재사용(수정 없음)**: `google-auth-button.tsx`, `shared/api/supabase/client.ts`, `shared/api/supabase/server.ts`, `map-error.ts`(매핑 테이블에 이메일 미인증 코드만 추가)

## 기술 결정

### 로그인 실패 통일 메시지 — BFF 계층에서 메시지를 하나로 고정

**Context** — spec-fixed.md는 이메일 미가입과 비밀번호 오류를 구분하지 않는 통일 메시지를 요구한다. Supabase는 이미 `invalid_credentials`라는 단일 에러 코드로 두 경우를 뭉뚱그려 반환하므로(Supabase 자체가 계정 존재 여부를 노출하지 않는 정책), 이 부분은 별도 로직 없이 `mapSupabaseAuthError`가 이미 처리하는 `invalid_credentials → INVALID_CREDENTIALS` 매핑을 그대로 재사용할 수 있다.

**Decision** — 로그인 BFF(`/api/auth/login`)는 `mapSupabaseAuthError`를 그대로 호출한다. 프론트엔드(`login-form.tsx`)는 `ApiErrorCode === 'INVALID_CREDENTIALS'`일 때 "이메일 또는 비밀번호가 올바르지 않습니다"라는 고정 문구를 표시한다(회원가입의 `CONFLICT` 처리와 동일한 패턴).

**Alternatives**

- 이메일 존재 여부를 먼저 조회해 프론트엔드에서 분기: Supabase가 이미 통일된 에러로 응답하는데 별도 조회 API를 추가하면, 그 조회 API 자체가 이메일 존재 여부를 확인하는 수단이 되어 spec-fixed.md가 막으려는 정보 노출을 스스로 만들어내는 모순이 생긴다.

**Consequences** — 장점: 별도 구현 없이 Supabase의 기본 보안 정책과 기존 에러 매핑 유틸을 그대로 재사용한다. 단점: 없음 — 이 결정은 사실상 "이미 있는 것을 그대로 쓴다"는 확인에 가깝다.

### 이메일 미인증 로그인 차단 — 신규 에러 코드 EMAIL_NOT_VERIFIED 추가

**Context** — spec-fixed.md는 이메일 미인증 상태를 로그인 실패와 다르게 취급해 `/auth/verify-email`로 안내할 것을 요구한다. Supabase는 이 상황을 `email_not_confirmed`라는 별도 에러 코드로 구분해 반환하므로, 로그인 실패(통일 메시지)와는 다른 분기가 필요하다. 기존 `ApiErrorCode` 유니온(`src/types/api.ts`)에는 이 상태를 표현할 코드가 없다.

**Decision** — `ApiErrorCode`에 `EMAIL_NOT_VERIFIED`를 추가하고, `map-error.ts`의 매핑 테이블에 `email_not_confirmed → EMAIL_NOT_VERIFIED`를 추가한다. 로그인 폼은 이 코드를 받으면 에러 메시지를 표시하는 대신 `router.push('/auth/verify-email')`로 즉시 이동한다.

**Alternatives**

- 기존 `AUTH_REQUIRED` 코드를 재사용: `AUTH_REQUIRED`는 "인증이 필요함"(예: 로그인 안 된 상태로 보호된 리소스 접근)이라는 다른 의미로 이미 쓰이고 있어, 의미가 다른 상황에 같은 코드를 쓰면 이후 코드를 읽는 사람이 두 상황을 혼동하게 된다.

**Consequences** — 장점: 에러 코드 하나가 정확히 하나의 상황만 의미하게 되어 `ApiErrorCode`가 여전히 단일 진실 공급원 역할을 한다. 단점: `ApiErrorCode` 유니온에 코드가 하나 늘어 이 프로젝트의 다른 백엔드/프론트 코드가 이 유니온을 exhaustive하게 switch하는 곳이 있다면 그 지점들도 함께 갱신해야 한다(현재 코드베이스에는 그런 exhaustive switch가 없음을 확인함).

### Google OAuth 콜백 — 리다이렉트 대상을 쿼리 파라미터 대신 고정 경로로 분리

**Context** — 기존 `/api/auth/callback/route.ts`는 실패 시 `${origin}/auth/register?error=oauth_failed`로 리다이렉트하도록 회원가입 전용으로 하드코딩되어 있었다. 이제 로그인 페이지에서도 같은 콜백을 재사용해야 하는데, 실패 시 어느 페이지로 돌아갈지가 "어느 페이지에서 버튼을 눌렀는가"에 따라 달라진다.

**Decision** — `GoogleAuthButton`이 `signInWithOAuth`의 `redirectTo`에 현재 페이지 경로를 실어 보내지 않고, 대신 콜백은 항상 실패 시 `/auth/login`으로 리다이렉트하도록 고정한다(로그인 페이지가 이메일/Google 두 로그인 경로의 공용 진입점이 되므로, 회원가입에서 실패해도 "다시 로그인 페이지에서 시도"로 안내하는 것이 자연스럽다). 성공 시 리다이렉트는 spec-fixed.md §6에 따라 홈(`/`)으로 고정한다(기존 `origin`은 사실상 이미 홈과 동일하므로 변경 없음).

**Alternatives**

- `redirectTo`에 `?from=register` 또는 `?from=login` 같은 쿼리 파라미터를 실어 콜백이 동적으로 분기: 실패 시 되돌아갈 페이지를 유연하게 지원할 수 있지만, spec-fixed.md가 리다이렉트 파라미터 지원 자체를 Out of Scope로 명시했고(§10), 회원가입 spec.md도 OAuth 관련 요구사항을 더 갖고 있지 않으므로 현재는 과설계다.

**Consequences** — 장점: 콜백 로직이 단순한 상수 리다이렉트로 유지되어 두 페이지가 하나의 콜백을 공유해도 코드가 늘지 않는다. 단점: 향후 회원가입 페이지에서도 다시 Google 버튼이 필요해지는 시나리오가 생기면(예: 소셜 가입 재도입), 실패 시 항상 로그인 페이지로 보내는 게 부적절해질 수 있다 — 그 시점에 재검토한다.

## Definition of Done

- [ ] 신규 환경변수 없음 (기존 Supabase 환경변수 재사용)
- [ ] Supabase 에러가 `ApiError`/`ApiErrorCode`로 매핑되어 프론트엔드에 원본 에러가 노출되지 않음
- [ ] 로그에 비밀번호 등 민감정보 출력 없음
- [ ] 이메일 미가입과 비밀번호 오류가 프론트엔드에서 구분되지 않고 통일 메시지로만 표시됨(코드 레벨에서 우연히 구분되지 않았는지 확인)

## Out of Scope

- Supabase MCP 연결 및 실제 로그인 연동 — 이 PRD는 요구사항·기술 결정까지, 구현은 이슈 분해 이후 별도 작업
- `/auth/forgot-password`, `/auth/reset-password` 실제 페이지 구현 — 로그인 폼에 링크만 배치
- 이메일 인증 메일 재발송 기능 — `/auth/verify-email`로 이동만 시킴, 그 페이지에서의 재발송 기능은 별도 스코프
- "로그인 상태 유지" 선택적 체크박스 — 항상 자동 유지(Supabase 기본 세션 refresh)로 고정, UI로 노출하지 않음
- 로그인 폼 실시간(onChange) 검증 — onBlur 고정
- Google 외 다른 OAuth Provider
- 리다이렉트 파라미터(`?redirect=`) 지원 — 로그인 성공 시 항상 홈(`/`)으로 고정
- 로그인 폼 시각 디자인 세부 스타일 — 디자인 시스템 적용은 별도 검증 단계에서 다룸

## 용어 정의

spec-fixed.md와 동일하게 사용한다.

| 용어               | 정의                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| 통일 메시지        | 이메일 미가입과 비밀번호 오류를 구분하지 않고 하나의 문구로 안내하는 에러 정책                                           |
| 세션 유지          | 브라우저 재실행/재방문 시에도 별도 재로그인 없이 로그인 상태가 유지되는 것. httpOnly 쿠키 + Supabase 세션 refresh로 구현 |
| EMAIL_NOT_VERIFIED | 이메일/비밀번호는 올바르지만 Supabase 이메일 인증이 완료되지 않아 로그인이 차단된 상태를 나타내는 `ApiErrorCode`         |

## 관련 문서

- [spec-fixed.md](./spec-fixed.md) — 확정 요구사항
- [../auth/spec.md](../auth/spec.md) — 회원가입 spec v3 (이메일 인증, Google OAuth 이관 배경)
- [../auth/prd.md](../auth/prd.md) — 회원가입 PRD (BFF 경유 원칙, Supabase 연동 구조 결정)
- [docs/routing.md](../routing.md) — auth 영역 라우팅 정의
