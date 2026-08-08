# 회원가입(auth/register) PRD

**작성일**: 2026-08-08 (v2: 2026-08-08 — Google 제거, 이름·개인정보 동의 반영 / v3: 2026-08-08 — UI 조정: 이름 필드 최상단 이동, 생년월일 필드 삭제)
**상태**: 요구사항·기술 결정 확정, spec.md v3 기준 재구현 진행

원본: [spec.md](./spec.md)

---

## 개요

`/auth/register`는 [docs/routing.md](../routing.md)에 정의된 인증 전용 독립 영역(`auth`)의 회원가입 페이지다. Supabase Auth를 인증 백엔드로 사용하며, 이메일/비밀번호 가입만 제공한다(Google 간편 로그인은 `/auth/login`으로 이관). 이메일 가입은 비밀번호 정책(영문+숫자+특수문자, 8자 이상)과 닉네임 실시간 중복 확인을 실시간으로 검증하고, 이름을 폼 최상단에서 함께 수집하며, 필수 개인정보 동의를 거쳐야 제출할 수 있다. 가입 후 Supabase 이메일 인증을 거쳐야 로그인할 수 있다.

## 사용자 스토리

1. 방문자는 이름(폼 최상단)·이메일·비밀번호·비밀번호 확인·닉네임을 입력해 회원가입할 수 있다.
2. 방문자는 비밀번호를 입력하는 동안 조건(길이, 영문, 숫자, 특수문자) 충족 여부를 실시간으로 확인할 수 있다.
3. 방문자는 비밀번호 확인 필드에서 원본과 불일치 시 즉시 안내를 받는다.
4. 방문자는 닉네임을 입력하는 동안 이미 사용 중인지 실시간으로 확인할 수 있다.
5. 방문자는 이용약관·개인정보처리방침에 각각 동의하거나, 전체 동의 체크박스로 한 번에 동의할 수 있다. 필수 동의를 완료하지 않으면 제출할 수 없다.
6. 방문자는 이미 가입된 이메일로 가입을 시도하면 폼 제출 시 에러 메시지로 안내받는다.
7. 방문자는 가입 성공 시 이메일 인증 안내 페이지(`/auth/verify-email`)로 이동해 인증 메일 발송 사실을 확인한다.

**v3 변경사항(UI 조정)**: 이름 필드를 폼 최상단으로 이동해 다른 필드보다 먼저 입력하도록 배치. 생년월일 필드는 삭제 — 이번 스코프에서 수집하지 않는다. 관련 스키마(`birthDateSchema`)와 BFF의 `user_metadata.birthDate` 저장 로직도 함께 제거했다.

**범위 변경(2026-08-08)**: Google 간편 로그인은 회원가입이 아닌 `/auth/login`에서 제공하는 것으로 재분류. 관련 코드(`google-auth-button.tsx`, `/api/auth/callback`)는 보존하고, 실제 배치·요구사항은 로그인 페이지 spec/PRD에서 다시 정의한다.

## 구현 계획

| 영역                     | 구현 위치                                                        | 비고                                                                                                                                         |
| ------------------------ | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 라우트                   | `src/app/auth/register/page.tsx`                                 | 서버 컴포넌트 셸, 폼은 클라이언트 컴포넌트 위임                                                                                              |
| 라우트                   | `src/app/auth/verify-email/page.tsx`                             | 가입 성공 후 이동, 인증 메일 안내만 표시                                                                                                     |
| 라우트                   | `src/app/legal/terms/page.tsx`, `src/app/legal/privacy/page.tsx` | 자리표시자 페이지, 실제 약관 본문은 Out of Scope                                                                                             |
| 회원가입 폼              | `src/features/auth/ui/register-form.tsx`                         | 클라이언트, `useAppForm(registerSchema, { mode: 'onChange' })` 사용, 이름 필드를 폼 최상단에 배치, 동의 필드 포함                            |
| 비밀번호 규칙 체크리스트 | `src/features/auth/ui/password-requirement-list.tsx`             | `form.watch('password')` 구독, 조건별 충족 여부 표시 (기존, 변경 없음)                                                                       |
| 닉네임 중복 확인         | `src/features/auth/lib/use-nickname-availability.ts`             | `form.watch('nickname')` + 디바운스(500ms) 후 BFF 조회 (기존, 변경 없음)                                                                     |
| 동의 체크박스 그룹       | `src/features/auth/ui/consent-checkbox-group.tsx`                | 전체 동의 + 개별 필수 동의 2종(이용약관/개인정보처리방침), 링크는 `/legal/*`로 연결                                                          |
| Zod 스키마               | `src/features/auth/model/schema.ts`                              | `registerSchema`에 `name`, `agreedToTerms`/`agreedToPrivacy`(`boolean` + `refine(true)`) 포함. `birthDateSchema`는 v3에서 삭제               |
| useAppForm 확장          | `src/shared/lib/hooks/use-app-form.ts`                           | `mode`, `defaultValues` 옵션 파라미터 추가 (boolean 필드 Controller의 uncontrolled→controlled 전환 경고 방지를 위해 `defaultValues` 필수)    |
| BFF 회원가입             | `src/app/api/auth/register/route.ts`                             | Supabase 서버 SDK로 가입 처리, `user_metadata`에 nickname/name 포함(v3에서 birthDate 제거), Supabase 에러를 `ApiError`/`ApiErrorCode`로 매핑 |
| BFF 닉네임 중복 확인     | `src/app/api/auth/check-nickname/route.ts`                       | Supabase 조회 후 `{ available: boolean }` 반환 (기존, 변경 없음)                                                                             |
| Supabase 서버 클라이언트 | `src/shared/api/supabase/server.ts`                              | Route Handler 전용, Service Role 미사용(Anon Key + 사용자 세션 기반) (기존, 변경 없음)                                                       |
| shadcn 원본 컴포넌트     | `src/components/ui/checkbox.tsx`                                 | 신규 설치, 직접 수정 금지 원칙에 따라 `register-form.tsx`/`consent-checkbox-group.tsx`에서 그대로 사용                                       |
| 에러 코드 확장           | `src/types/api.ts`                                               | 기존 `CONFLICT`(이메일 중복), `VALIDATION_ERROR`(비밀번호/닉네임/생년월일/동의 형식) 재사용, 신규 코드 추가 없음                             |

**보존(이번 스코프에서 다루지 않음)**: `google-auth-button.tsx`, `src/app/api/auth/callback/route.ts`, `src/shared/api/supabase/client.ts` — 로그인 페이지 작업 시 재사용

## 기술 결정

### Supabase 연동 구조 — BFF 경유

**Context** — 프로젝트 CLAUDE.md는 Route Handler를 BFF로 사용하고 인증 토큰을 httpOnly 쿠키로 관리하는 원칙을 이미 명시하고 있다. Supabase는 자체 클라이언트 SDK로 브라우저에서 직접 인증을 처리할 수도 있으나, 이는 기존 원칙과 충돌한다.

**Decision** — 클라이언트는 자체 Route Handler(`/api/auth/register`, `/api/auth/check-nickname`, `/api/auth/callback`)만 호출한다. Route Handler 내부에서 Supabase 서버 SDK(Anon Key + 사용자 세션)를 사용해 가입/조회/OAuth 콜백을 처리하고, 세션은 httpOnly 쿠키로 관리한다. Supabase가 반환하는 원본 에러(예: `user_already_exists`)는 BFF 계층에서 기존 `ApiErrorCode`(`CONFLICT`, `VALIDATION_ERROR` 등)로 매핑한다.

**Alternatives**

- 클라이언트에서 `@supabase/supabase-js` 직접 호출: 구현은 더 빠르지만, 기존 BFF/httpOnly 쿠키 원칙과 정면으로 어긋난다. 이후 다른 인증 관련 페이지(로그인, 비밀번호 재설정)에서도 원칙이 갈라지는 선례를 남기게 된다.

**Consequences** — 장점: 기존 인증 아키텍처 원칙을 그대로 유지, Supabase 에러가 프로젝트 표준 에러 형식으로 흡수되어 프론트엔드가 Supabase를 직접 알 필요가 없다. 단점: Route Handler 계층이 하나 더 생겨 클라이언트 SDK 직접 호출 대비 왕복이 한 번 더 든다(가입처럼 빈도 낮은 액션에서는 체감 차이 없음).

### 폼 검증 모드 — useAppForm에 mode 옵션 추가

**Context** — `useAppForm`은 현재 `mode: 'onBlur'`로 고정되어 있다. spec.md는 비밀번호 조건 체크리스트와 비밀번호 확인 일치 여부를 타이핑 중(`onChange`) 즉시 보여줄 것을 요구한다.

**Decision** — `useAppForm(schema, options?)` 형태로 두 번째 인자를 받아 `mode`를 오버라이드할 수 있게 한다. 회원가입 폼은 `useAppForm(registerSchema, { mode: 'onChange' })`로 호출한다. 기존 호출부(`useAppForm(schema)`)는 옵션을 생략하면 기존과 동일하게 `onBlur`로 동작해 하위 호환을 유지한다.

**Alternatives**

- 비밀번호 필드만 `form.watch('password')`로 별도 구독해 체크리스트 로직을 완전히 분리: `useAppForm` 자체는 건드리지 않지만, "폼 검증 모드"와 "체크리스트 표시 로직"이라는 사실상 같은 관심사가 두 군데(RHF mode, watch 기반 커스텀 로직)로 쪼개져 유지보수 시 헷갈린다. `mode: 'onChange'`로 전환하면 RHF의 `formState.errors`가 이미 실시간으로 갱신되므로 별도 watch 로직이 필요 없다.

**Consequences** — 장점: RHF의 표준 실시간 검증 메커니즘을 그대로 활용해 별도 로직 없이 `formState.errors`만으로 체크리스트를 구성할 수 있다. 기존 `onBlur` 폼에는 영향 없음. 단점: `onChange` 모드는 매 입력마다 전체 스키마 재검증이 돌아 `onBlur`보다 리렌더링이 잦다(비밀번호 필드 하나 규모에서는 체감 차이 없음).

### 닉네임 중복 확인 — 디바운스 후 BFF 호출

**Context** — spec.md는 닉네임 실시간 중복 확인을 요구한다. 입력마다 즉시 서버에 조회하면 불필요한 API 호출이 과도하게 발생한다.

**Decision** — 닉네임 필드는 `use-nickname-availability.ts` 훅에서 `useDebouncedValue`(기존 `src/shared/lib/hooks/use-debounced-value.ts` 재사용, 500ms)를 거친 값만 `/api/auth/check-nickname`으로 조회한다. 조회 중에는 로딩 상태를, 완료 후에는 사용 가능/중복 여부를 필드 하단에 표시한다.

**Alternatives**

- 포커스 아웃(blur) 시점에만 1회 조회: 구현이 가장 간단하지만 spec.md가 명시한 "실시간" 요구와 어긋난다 — 사용자가 닉네임을 다 입력하고 다른 필드로 넘어가기 전까지 중복 여부를 알 수 없다.
- 클라이언트가 Supabase에 직접 조회: 위 "Supabase 연동 구조" 결정(BFF 경유)과 모순되며, Anon Key로 사용자 테이블을 클라이언트에서 직접 조회하도록 RLS를 열어야 해 보안 표면이 넓어진다.

**Consequences** — 장점: 기존 `use-debounced-value.ts`를 그대로 재사용(2회 규칙 충족 사례), API 호출 빈도와 실시간성 사이 균형을 확보. 단점: 디바운스 대기 시간(500ms) 동안 사용자는 결과를 보지 못하는 짧은 지연이 있다 — 로딩 인디케이터로 상태를 명확히 표시해 완화한다.

### 생년월일 입력 — v3에서 필드 자체를 삭제 (기술 결정 철회)

v2에서 "네이티브 input[type=date] vs shadcn Calendar" 결정을 내렸으나, v3 UI 조정으로 생년월일 필드 자체가 회원가입 스코프에서 빠졌다. 관련 스키마(`birthDateSchema`)와 BFF `user_metadata.birthDate` 저장 로직을 모두 제거했다. 날짜 입력이 필요한 필드가 이후 다시 생기면 그때 별도로 재검토한다.

### 폼 boolean 필드의 defaultValues 필수 — Checkbox uncontrolled→controlled 전환 방지

**Context** — 동의 체크박스 구현 중 브라우저 콘솔에서 "A component is changing the uncontrolled checked state of Checkbox to be controlled" 경고가 발생했고, 전체 동의를 체크해도 개별 체크박스에 값이 반영되지 않는 버그로 이어졌다. 원인은 `useAppForm`이 `defaultValues`를 받지 않아 `agreedToTerms`/`agreedToPrivacy`가 첫 렌더링에서 `undefined`로 시작했기 때문이다 — Base UI Checkbox는 첫 렌더링 시점의 값이 `undefined`인지 여부로 uncontrolled/controlled를 결정하는데, 이후 `setValue`로 boolean 값이 들어오면서 상태 관리 방식이 런타임에 바뀌어버렸다.

**Decision** — `useAppForm`에 `defaultValues` 옵션을 추가하고, `register-form.tsx`에서 모든 필드(특히 `agreedToTerms: false`, `agreedToPrivacy: false`)의 초기값을 명시적으로 지정한다.

**Alternatives**

- 체크박스 컴포넌트 쪽에서 `checked={field.value ?? false}`로 방어: 증상은 없어지지만 근본 원인(폼 전체가 초기값 없이 시작하는 것)은 그대로 남아 다른 boolean/enum 필드에서 동일 버그가 재발할 수 있다.

**Consequences** — 장점: RHF 폼의 모든 필드가 첫 렌더링부터 확정된 타입으로 시작해, boolean 외의 향후 controlled 컴포넌트(select, radio 등)에서도 동일 문제가 구조적으로 방지된다. 단점: 매 `useAppForm` 호출부에서 `defaultValues`를 빠짐없이 채워야 하는 보일러플레이트가 늘어난다 — 폼 필드 개수가 늘어날수록 명시적으로 관리해야 할 목록도 함께 늘어난다.

### 개인정보 동의 — Zod boolean + refine(true), 전체 동의는 파생 상태

**Context** — spec.md v2는 이용약관/개인정보처리방침 동의를 각각 필수로 요구하며, 전체 동의 체크박스로 한 번에 처리할 수 있어야 한다. 필수 동의 미체크 시 제출이 막혀야 한다.

**Decision** — `registerSchema`에 `agreedToTerms`/`agreedToPrivacy`를 `z.boolean().refine((v) => v === true)` 형태로 추가해 RHF/Zod의 기존 폼 검증 파이프라인에 동의 여부를 자연스럽게 편입시킨다(값이 `true`가 아니면 다른 필드와 동일하게 `formState.errors`에 잡힘). 전체 동의 체크박스는 별도 폼 필드로 스키마에 넣지 않고, `consent-checkbox-group.tsx` 내부에서 두 값의 파생 상태(`agreedToTerms && agreedToPrivacy`)로 계산해 표시 전용으로만 사용한다. 전체 동의를 체크하면 두 필드에 각각 `setValue(true)`를 호출한다.

**Alternatives**

- 전체 동의를 별도 스키마 필드로 추가: 전체 동의와 개별 동의 두 가지 진실 공급원이 생겨, 개별 항목만 체크하고 전체 동의 값이 갱신되지 않는 동기화 버그 위험이 생긴다. 파생 상태로 두면 항상 개별 값 2개만 진실 공급원이 된다.
- `z.literal(true)` 사용: 처음에는 이 방식으로 구현했으나, RHF `defaultValues`의 boolean 필드(`false`)와 타입이 맞지 않아(`boolean`은 `true` 리터럴 타입에 대입 불가) `Control`/`UseFormSetValue` 제네릭 전체가 깨졌다. `boolean` + `refine`으로 바꿔 폼의 실제 값 타입(`boolean`)과 검증 규칙(반드시 `true`)을 분리했다.

**Consequences** — 장점: 기존 폼 검증 파이프라인(useAppForm, formState.errors)을 그대로 재사용해 별도 제출 가드 로직이 필요 없다. 진실 공급원이 개별 동의 2개로 고정되어 동기화 버그가 구조적으로 발생하지 않는다. 단점: 향후 선택 동의(마케팅 수신 등)가 추가되면 전체 동의 파생 로직에 조건 분기가 하나씩 늘어난다 — 이번 스코프는 필수 동의만이므로 해당 없음.

## Definition of Done

- [ ] `.env.example`에 Supabase 관련 환경변수 키 추가 (실제 값 없이)
- [ ] `src/shared/config/env.ts`에 Supabase 환경변수 Zod 검증 추가
- [ ] Secret 하드코딩 없음 (Service Role Key 등 서버 전용 키가 클라이언트 코드에 등장하지 않음)
- [ ] 클라이언트 노출 가능 여부 검토 완료 (§Security Impact 참조)
- [ ] Supabase 에러가 `ApiError`/`ApiErrorCode`로 매핑되어 프론트엔드에 원본 에러가 노출되지 않음

## Security Impact

**신규 환경변수** (실제 값은 이 문서에 기록하지 않음, Supabase 프로젝트 대시보드에서 발급)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

이번 스코프의 가입 흐름은 Anon Key + 사용자 세션으로 충분하므로 `SUPABASE_SERVICE_ROLE_KEY`는 도입하지 않는다. 클라이언트에 노출되면 인가 검사를 우회하는 고위험 키이므로, 실제로 관리자 권한 작업(예: 관리자 페이지에서 사용자 강제 탈퇴)이 필요해지는 시점에만 별도 PRD로 재검토한다.

**개인정보 항목 확대(v2)**: 이름이 신규 수집 항목에 추가되어 개인정보처리방침 동의 없이는 수집할 수 없다(§Out of Scope 및 spec.md §6 참조). 이름은 Supabase `user_metadata`에 저장하며 별도 평문 로그 출력 금지. (v3: 생년월일은 수집 항목에서 제외)

**노출 범위**

- Client: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**보관 위치**

- `.env.local`(로컬, Git 추적 제외), 배포 환경의 환경변수 설정(예: Vercel Environment Variables)

## Out of Scope

- Supabase MCP 연결 및 실제 코드 구현 — 이 PRD는 요구사항·기술 결정까지, 구현은 이슈 분해 이후 별도 작업
- Google 등 OAuth 간편 로그인 — `/auth/login`에서 제공하는 것으로 재분류(v2). `google-auth-button.tsx`, `/api/auth/callback`, `shared/api/supabase/client.ts`는 코드로 보존하되 배치·요구사항은 로그인 페이지 spec/PRD에서 다시 정의
- 로그인(`/auth/login`), 비밀번호 재설정(`/auth/forgot-password`, `/auth/reset-password`) 페이지 — 별도 spec/PRD로 다룸. 회원가입과는 화면·흐름이 독립적이라 이 PRD에 포함하면 스코프가 섞이므로, 각 페이지 착수 시점에 별도로 요구사항 인터뷰부터 다시 진행한다
- 닉네임 정확한 길이 범위(예: 2~20자)의 최종 확정 — 구현 이슈 단계에서 확정
- 이메일 인증 메일 템플릿 커스터마이징 — Supabase 기본 템플릿 사용
- CSRF 방어 심화 설계 — SameSite 쿠키 기본값으로 충분한지는 prd.md(§8 Open Questions)에서 이미 별도 검토 대상으로 지정됨, 이번 스코프에서 추가 설계하지 않음
- 회원가입 폼 자체의 시각 디자인(레이아웃, 색상 등 세부 스타일) — 디자인 시스템 적용은 별도 검증 단계에서 다룸
- 이용약관·개인정보처리방침 실제 본문 작성 — 법무 검토가 필요한 법적 문서이므로 AI가 작성하지 않음. `/legal/terms`, `/legal/privacy`는 자리표시자 페이지로만 구현
- 마케팅 정보 수신 동의 등 선택 동의 항목 — 이번 스코프는 필수 동의(이용약관/개인정보처리방침)만
- 이름 형식의 추가 검증(예: 실명 인증) — 공백 아님 검증만 적용, 그 이상의 검증 로직은 이번 스코프가 아님
- 생년월일 수집 — v3에서 스코프 제외. 향후 다시 필요해지면 별도 인터뷰부터 재시작

## 용어 정의

spec.md와 동일하게 사용한다.

| 용어        | 정의                                                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------ |
| 닉네임      | 서비스 내 표시 이름. 로그인 식별자(이메일)·실명(이름)과 별개                                                             |
| 실시간 검증 | 사용자가 입력 중(`onChange`)일 때 즉시 수행되는 클라이언트 측 유효성 검사                                                |
| 전체 동의   | 이용약관·개인정보처리방침 등 필수 동의 항목을 한 번에 체크하는 일괄 체크박스. 별도 상태값이 아닌 개별 동의값의 파생 상태 |
| BFF         | Backend For Frontend. 여기서는 Next.js Route Handler가 Supabase와 클라이언트 사이를 중개하는 계층                        |

## 관련 문서

- [spec.md](./spec.md) — 확정 요구사항
- [docs/routing.md](../routing.md) — auth 영역 라우팅 정의
