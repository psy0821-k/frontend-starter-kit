# 마이페이지 PRD

원본: [spec-original.md](./spec-original.md) · 확정 스펙: [spec-fixed.md](./spec-fixed.md)

---

## 개요

로그인한 사용자가 본인 계정을 관리하는 `/mypage`를 신설한다. 하나의 큰 기능이 아니라 **닉네임 변경 → 북마크 삭제(목록 포함) → 회원 탈퇴** 순서로 애자일하게 3개 이슈로 쪼개 진행한다. 각 이슈는 독립적으로 배포 가능한 수직 슬라이스다.

이 PRD는 3개 기능에 공통되는 페이지 골격(라우트, 인증 가드, 진입점)과, 기능별로 필요한 기술 결정을 함께 다룬다.

## 사용자 스토리

1. 로그인한 사용자는 헤더의 자기 닉네임을 클릭해 `/mypage`로 이동할 수 있다.
2. 비로그인 사용자가 `/mypage`에 직접 접근하면 로그인 페이지로 이동한다.
3. 사용자는 마이페이지에서 닉네임을 다른 값으로 바꿀 수 있고, 변경 즉시 헤더 표시도 갱신된다.
4. 사용자는 마이페이지에서 본인이 북마크한 template/feature 목록을 보고, 각 항목을 개별적으로 삭제(북마크 해제)할 수 있다.
5. 사용자는 마이페이지에서 본인 닉네임을 정확히 입력해 확인한 뒤 계정을 완전히 삭제(탈퇴)할 수 있다.

## 구현 계획

| 영역                                 | 구현 위치                                            | 비고                                                            |
| ------------------------------------ | ---------------------------------------------------- | --------------------------------------------------------------- |
| 마이페이지 라우트                    | `src/app/mypage/page.tsx` (신규)                     | 서버 컴포넌트, `getCurrentUser()`로 인증 가드                   |
| 헤더 진입점                          | `src/app/_components/header.tsx` (수정)              | `{닉네임}님` 텍스트를 `<Link href="/mypage">`로 전환            |
| **[기능 1] 닉네임 단일 소스화**      | `src/shared/api/auth/get-current-user.ts` (수정)     | `auth.users.user_metadata` 대신 `profiles.nickname` 조회        |
| **[기능 1] 닉네임 변경 API**         | `src/app/api/mypage/nickname/route.ts` (신규)        | PATCH, `nicknameSchema` + 중복 검사 + `profiles` UPDATE         |
| **[기능 1] 닉네임 변경 UI**          | `src/features/mypage/ui/nickname-form.tsx` (신규)    | 기존 `check-nickname` 훅(`use-nickname-availability.ts`) 재사용 |
| **[기능 2] 북마크 목록 조회**        | `src/features/mypage/api/get-my-bookmarks.ts` (신규) | `bookmarks` × `templates`/`features` join, 서버 컴포넌트용      |
| **[기능 2] 북마크 목록 UI**          | `src/features/mypage/ui/my-bookmark-list.tsx` (신규) | 타입 배지 + 삭제 버튼, 기존 `removeBookmark` 재사용             |
| **[기능 3] service_role 클라이언트** | `src/shared/api/supabase/admin.ts` (신규)            | `SUPABASE_SERVICE_ROLE_KEY` 전용, Route Handler에서만 import    |
| **[기능 3] 회원 탈퇴 API**           | `src/app/api/mypage/withdraw/route.ts` (신규)        | 세션에서 user id 추출 → `admin.deleteUser` 호출                 |
| **[기능 3] 탈퇴 확인 UI**            | `src/features/mypage/ui/withdraw-dialog.tsx` (신규)  | 닉네임 입력 일치 시에만 버튼 활성화                             |
| 환경변수 검증                        | `src/shared/config/env.ts` (수정)                    | `SUPABASE_SERVICE_ROLE_KEY` 서버 전용 스키마 추가               |
| 환경변수 문서화                      | `.env.example` (수정)                                | `SUPABASE_SERVICE_ROLE_KEY=YOUR_...` 플레이스홀더               |

## 기술 결정

### 결정 1 — 닉네임 단일 소스: `profiles.nickname`으로 통일

**Context** — spec-fixed.md에서 이미 `profiles.nickname`을 단일 소스로 쓰기로 결정했다(사전 정리 섹션). 다만 `getCurrentUser()`가 이 값을 조회하는 구체적 방법(추가 쿼리 vs 세션 갱신 vs 다른 방식)은 PRD에서 정한다.

| #   | 기준                 | 안 A: `getCurrentUser()`에서 `profiles` 테이블 추가 조회                                                             | 안 B: 닉네임 변경 시 `auth.users.user_metadata`도 함께 갱신(기존 방식 유지) | 안 C: 닉네임을 JWT claim에 넣어 세션에서 직접 읽기                                                                  |
| --- | -------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 1   | 데이터 구조          | `profiles.nickname`이 유일한 소스, `auth.users.user_metadata.nickname`은 가입 시점 초기값으로만 남고 이후 갱신 안 함 | 두 곳 모두 최신값 유지(현재 불일치의 재발 소지)                             | `raw_app_meta_data`에 nickname을 넣고 JWT에 노출                                                                    |
| 2   | API 레이어 변경지점  | `getCurrentUser()`가 `auth.getUser()` 후 `profiles` 테이블에 추가 SELECT 1회                                         | 닉네임 변경 API가 `profiles` UPDATE와 `auth.updateUser()` 둘 다 호출        | 닉네임 변경 시 `admin.updateUserById`로 app_metadata 갱신(service_role 필요)                                        |
| 3   | 상태관리 변경지점    | 없음(서버 함수 내부 변경만)                                                                                          | 없음                                                                        | 없음                                                                                                                |
| 4   | 핵심 동작            | 매 요청마다 DB 조회 1회 추가(가벼운 쿼리, `profiles.id`가 PK)                                                        | 두 storage를 동기화해야 하는 책임이 계속 남음                               | JWT 갱신 시점(리프레시)까지 지연 가능성 — 즉시 반영이 안 될 수 있음                                                 |
| 5   | 컴포넌트 구조        | 영향 없음                                                                                                            | 영향 없음                                                                   | 영향 없음                                                                                                           |
| 6   | 기존 패턴과의 일관성 | `get-current-user.ts`가 이미 `isSupabaseConfigured` 체크 후 Supabase 클라이언트를 쓰는 구조라 쿼리 추가가 자연스러움 | 현재 상태(불일치의 원인)를 그대로 답습                                      | `raw_app_meta_data` 수정에 service_role이 또 필요해져, 이미 기능 3에서만 도입하기로 한 service_role 사용처가 늘어남 |
| 7   | 테스트 용이성        | `get-current-user.test.ts`(신규)에서 `profiles` mock만 추가하면 됨                                                   | 두 군데 동기화 여부를 매번 검증해야 해 테스트 케이스 증가                   | service_role mock까지 필요해 테스트 복잡도 증가                                                                     |

**Decision** — 안 A. `getCurrentUser()`가 `auth.getUser()`로 세션을 확인한 뒤 `profiles.nickname`을 추가 조회하도록 수정한다. `auth.users.user_metadata.nickname`은 가입 직후 초기값으로만 남기고 이후 갱신 대상에서 제외한다.

**Alternatives**

- 안 B: 현재 불일치 상태를 야기한 원인 그 자체이므로 기각.
- 안 C: JWT/app_metadata 갱신에 service_role이 필요해, "회원 탈퇴에서만 service_role을 쓴다"는 최소 침습 원칙과 어긋나 기각.

**Consequences**

- 장점: 닉네임의 진실 공급원이 하나로 명확해지고, 매 페이지 로드 시 발생하는 추가 쿼리는 `profiles.id`가 PK라 비용이 무시할 수준.
- 단점: `getCurrentUser()`가 이제 두 번의 왕복(auth 세션 확인 + profiles 조회)을 하게 되어, 아주 미세하게 응답 시간이 늘어난다.

---

### 결정 2 — 회원 탈퇴: service_role 클라이언트 격리 방식

**Context** — spec-fixed.md에서 `SUPABASE_SERVICE_ROLE_KEY`를 서버 전용으로 도입하기로 결정했다. 이 키를 코드베이스 어디에 두고 어떻게 격리할지가 보안상 가장 중요한 지점이다.

| #   | 기준                 | 안 A: 전용 `admin.ts` 모듈로 격리 + 탈퇴 Route Handler에서만 import                                                                 | 안 B: 기존 `createSupabaseServerClient()`에 옵션 플래그 추가                                                         | 안 C: Supabase Edge Function으로 분리                                                                             |
| --- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 1   | 데이터 구조          | 영향 없음(auth.users 삭제는 스키마 변경 없음)                                                                                       | 영향 없음                                                                                                            | 영향 없음                                                                                                         |
| 2   | API 레이어 변경지점  | `src/shared/api/supabase/admin.ts` 신규 — `createClient(url, serviceRoleKey)`만 export, 다른 곳에서 import 안 하면 번들에 안 들어감 | `createSupabaseServerClient(useServiceRole?: boolean)`처럼 기존 함수에 분기 추가                                     | 별도 Edge Function 배포 필요, Next.js Route Handler가 그 함수를 fetch로 호출                                      |
| 3   | 상태관리 변경지점    | 없음                                                                                                                                | 없음                                                                                                                 | 없음                                                                                                              |
| 4   | 핵심 동작            | `/api/mypage/withdraw`가 `admin.ts`를 import해 `admin.deleteUser(session.user.id)` 호출                                             | 동일하지만 진입점이 여러 곳으로 늘어날 수 있는 구조라 실수로 다른 Route Handler가 `useServiceRole: true`를 넘길 위험 | Next.js 앱과 별개로 Supabase CLI 배포/시크릿 관리가 추가로 필요                                                   |
| 5   | 컴포넌트 구조        | 영향 없음                                                                                                                           | 영향 없음                                                                                                            | 영향 없음                                                                                                         |
| 6   | 기존 패턴과의 일관성 | `server.ts`(anon) / `client.ts`(브라우저)처럼 "용도별로 파일을 분리"하는 기존 패턴과 동일                                           | 기존 `createSupabaseServerClient()`의 "Anon Key만 쓴다"는 문서화된 계약을 깨뜨림(주석과 실제 동작 불일치)            | 이 프로젝트가 지금까지 Edge Function을 쓴 적이 없어(Resend 연동도 Custom SMTP로 대체) 새로운 배포 파이프라인 도입 |
| 7   | 테스트 용이성        | `admin.ts`를 모킹하는 테스트 1개 파일만 필요, 나머지 Route Handler 테스트는 영향 없음                                               | 기존 `createSupabaseServerClient` 모킹 테스트 전체가 옵션 인자를 고려해야 해서 회귀 위험                             | Edge Function은 이 프로젝트의 기존 Vitest 스위트로 테스트하기 어려움(별도 런타임)                                 |

**Decision** — 안 A. `src/shared/api/supabase/admin.ts`를 새로 만들어 `SUPABASE_SERVICE_ROLE_KEY`로 클라이언트를 생성하는 함수 하나만 export한다. 이 모듈은 `/api/mypage/withdraw/route.ts`에서만 import한다. 기존 `createSupabaseServerClient()`(anon 전용)는 시그니처와 문서 주석을 그대로 유지해 "Anon Key만 쓴다"는 계약이 깨지지 않도록 한다.

**Alternatives**

- 안 B: 기존 함수에 분기를 추가하면 "이 함수는 anon key만 쓴다"는 현재 문서화된 불변식이 깨지고, 다른 개발자(또는 AI)가 실수로 `useServiceRole: true`를 다른 Route Handler에 흘려 넣을 위험이 생겨 기각.
- 안 C: 이 프로젝트 규모(1인 개발, 단일 Next.js 배포)에서 별도 Edge Function 배포 파이프라인을 도입하는 비용이 얻는 이득보다 크고, 기존 "불필요한 라이브러리/인프라를 추가하지 않는다"는 CLAUDE.md 원칙과 어긋나 기각.

**Consequences**

- 장점: `service_role` 키를 사용하는 코드 경로가 파일 하나로 좁혀져 리뷰·감사가 쉽다. 실수로 다른 곳에서 import하면 코드 리뷰에서 바로 눈에 띈다.
- 단점: 새 파일이 하나 늘어나고, "server.ts와 뭐가 다른가"를 처음 보는 개발자에게 설명하는 주석이 필요하다(이미 spec-fixed.md에 Security Impact로 기록해둠).

## Out of Scope

spec-fixed.md의 Out of Scope를 그대로 따른다. 추가되는 항목:

- 닉네임 변경 이력 저장/감사 로그
- 회원 탈퇴 시 이메일 재확인(2단계 인증) — 닉네임 입력 확인 1단계로 충분하다고 판단
- 탈퇴 유예 기간(예: 7일 후 실제 삭제) — 즉시 삭제만 지원

## 용어 정의

spec-fixed.md의 용어 정의를 그대로 따른다.

## 관련 문서

- [spec-original.md](./spec-original.md) — 초기 아이디어(v1, 범위 변경 전)
- [spec-fixed.md](./spec-fixed.md) — 확정 요구사항 v2, service_role 도입 Security Impact
