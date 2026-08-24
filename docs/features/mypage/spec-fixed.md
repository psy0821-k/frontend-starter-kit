# 마이페이지 — 확정 요구사항

**상태**: 확정 v2 (2026-08-24) — 범위를 "프로필 표시 + 북마크 모아보기"에서 **3개 액션 기능**(닉네임 변경, 북마크 삭제, 회원 탈퇴)으로 재정의. 각 기능은 애자일하게 별도 이슈로 순차 진행한다: **닉네임 변경 → 북마크 삭제 → 회원 탈퇴**.
**의존성**: 인증(로그인/Google OAuth), 북마크 기능(`src/features/bookmark/`, `public.bookmarks`), 닉네임 중복 검사(`check-nickname`)
**원본**: [spec-original.md](./spec-original.md) (v1, 범위 변경 전 기록으로 보존)

## 용어 정의 (Ubiquitous Language)

| 용어             | 의미                                                                         |
| ---------------- | ---------------------------------------------------------------------------- |
| 마이페이지       | 로그인한 사용자 본인의 계정을 관리하는 `/mypage` 페이지                      |
| 내 북마크        | 마이페이지에서 사용자가 북마크한 template/feature를 보여주는 목록(삭제 가능) |
| 탈퇴 확인 문자열 | 회원 탈퇴 시 본인 확인을 위해 입력해야 하는 현재 닉네임                      |

## 라우트 & 진입점

- 위치: `/mypage` — Starter/Template/Feature 3분류에 속하지 않는 최상위 독립 경로(`/auth`와 동급).
- 비로그인 접근 시: `/auth/login`으로 리다이렉트.
- 진입점: 헤더(`src/app/_components/header.tsx`)의 로그인 사용자 메뉴 영역에 "마이페이지" 링크를 새 항목으로 추가한다(기존 `{닉네임}님` 텍스트는 그대로 두고, 옆에 별도 링크를 둔다).

## 사전 정리 — 닉네임 단일 소스화

**배경**: 현재 `getCurrentUser()`(`get-current-user.ts`)는 `auth.users.raw_user_meta_data.nickname`을 읽고, `check-nickname` 중복 검사는 `public.profiles.nickname`을 본다 — 두 값이 서로 다른 곳에 있다.

**결정**: `public.profiles.nickname`을 닉네임의 단일 소스로 통일한다. `getCurrentUser()`가 `profiles.nickname`을 읽도록 수정한다(`auth.users.user_metadata.nickname`은 더 이상 닉네임 표시 용도로 쓰지 않음 — 가입 시 초기값 기록 목적으로만 남을 수 있음, 상세는 이슈 단계에서 판단). 이 정리는 "닉네임 변경" 이슈의 선행 작업으로 포함한다.

---

## 기능 1 — 닉네임 변경

### 범위

마이페이지에서 본인의 닉네임을 다른 값으로 바꾼다.

- 입력값은 기존 `nicknameSchema`(2~20자)로 검증.
- 기존 `check-nickname` API(또는 동일 로직)로 중복 여부 확인 후 저장.
- 저장 대상은 `public.profiles.nickname` (위 "사전 정리" 참고).
- 성공 시 헤더의 `{닉네임}님` 표시도 즉시 갱신되어야 한다.

### Acceptance Criteria 후보

- Given 로그인한 사용자, When 마이페이지에서 새 닉네임을 입력하고 저장하면, Then `profiles.nickname`이 갱신되고 헤더 표시도 새 닉네임으로 바뀐다
- Given 이미 사용 중인 닉네임, When 그 값으로 저장을 시도하면, Then 에러가 표시되고 저장되지 않는다
- Given 2자 미만/20자 초과 닉네임, When 저장을 시도하면, Then 유효성 에러가 표시된다
- Given 현재와 동일한 닉네임, When 저장을 시도하면, Then (정책 확정 필요 — 이슈 단계에서 "무변경 허용" 여부 결정)

---

## 기능 2 — 북마크 항목 삭제 (북마크 목록 포함)

### 범위

마이페이지에 "내 북마크" 목록을 표시하고, 각 항목에 삭제 버튼을 둔다.

- template과 feature를 하나의 목록에 섞어서 보여주되 타입 배지("템플릿"/"기능")로 구분한다.
- 데이터: `public.bookmarks`에서 `user_id = 현재 사용자`인 행을 `target_type`에 따라 `templates` 또는 `features`와 join하여 제목 등 표시 정보를 가져온다.
- **삭제된 원본 처리**: 북마크한 target이 관리자에 의해 이미 삭제된 경우, join 결과가 없으므로 그 북마크는 목록에서 조용히 제외한다.
- 삭제 버튼: 기존 `removeBookmark`(`bookmark-client.ts`)를 재사용하거나 동일한 `DELETE /api/bookmarks` 계약을 그대로 따른다.
- 삭제 후 목록에서 즉시 사라져야 한다(낙관적 업데이트 또는 재조회).

### Acceptance Criteria 후보

- Given 템플릿 2개와 기능 1개를 북마크한 사용자, When 마이페이지의 내 북마크 목록을 보면, Then 3개 항목이 타입 배지와 함께 표시된다
- Given 북마크 목록의 항목, When 삭제 버튼을 클릭하면, Then 그 항목이 목록에서 사라지고 `bookmarks` 테이블에서도 삭제된다
- Given 북마크한 템플릿이 관리자에 의해 삭제된 상태, When 내 북마크 목록을 보면, Then 그 항목은 표시되지 않는다
- Given 아무것도 북마크하지 않은 사용자, When 내 북마크 목록을 보면, Then 빈 상태(empty state) 안내가 표시된다

---

## 기능 3 — 회원 탈퇴

### 범위

로그인한 사용자가 본인 계정을 완전히 삭제한다.

### 데이터 처리

`auth.users`에서 계정을 삭제하면 기존 FK cascade(`profiles.id`, `bookmarks.user_id`, `templates.author_id` 모두 `on delete cascade`)로 관련 데이터가 자동 정리된다. 관리자 계정을 탈퇴시키면 그가 등록한 템플릿도 함께 삭제되는 기존 cascade 동작을 그대로 유지한다(별도 예외 처리 없음).

### 확인 절차 (안전장치)

되돌릴 수 없는 파괴적 액션이므로, 확인 다이얼로그에서 **본인의 현재 닉네임을 정확히 입력**해야 "탈퇴하기" 버튼이 활성화된다(고정 문자열 "탈퇴" 타이핑이 아니라 실제 닉네임 일치 여부로 검증).

### 기술 결정 — Service Role Key 도입 (Security Impact)

**Context**: 사용자가 자기 계정을 완전히 삭제하려면 Supabase Admin API(`auth.admin.deleteUser`)가 필요한데, 이 API는 `service_role` 키 없이는 호출할 수 없다. 이 프로젝트는 지금까지 `service_role` 키를 전혀 쓰지 않는 원칙이었다(`001_initial_schema.sql` 주석: "이 프로젝트는 Service Role Key를 사용하지 않으므로, 모든 쓰기는 anon key + 사용자 세션으로 나간다").

**Decision**: `SUPABASE_SERVICE_ROLE_KEY`를 서버 전용 환경변수로 새로 도입한다. `/api/mypage/withdraw`(가칭) Route Handler 내부에서만 이 키로 별도 Supabase 클라이언트를 생성해 `admin.deleteUser`를 호출한다.

**Alternatives**:

- 완전 삭제 대신 "비활성화"(soft delete) 방식 — `service_role` 없이 클라이언트만으로 처리 가능하지만, 비밀번호를 임의 값으로 바꿔 재로그인을 막는 등 우회적인 구현이 필요하고 "계정이 실제로 삭제되었다"는 사용자 기대와 어긋나 거부.

**Consequences**:

- 장점: Supabase 표준 방식으로 완전한 계정 삭제가 가능해짐.
- 단점: 이 프로젝트 최초로 `service_role` 키가 도입되어, 취급 범위(서버 전용, 절대 클라이언트 번들에 포함 금지)를 새로 지켜야 함. 해당 Route Handler는 반드시 호출 전 현재 세션이 삭제 대상 본인인지 검증해야 하며, 이 검증이 빠지면 임의 계정을 삭제할 수 있는 심각한 취약점이 된다.

**Security Impact**:

- 신규 환경변수: `SUPABASE_SERVICE_ROLE_KEY` (서버 전용, `NEXT_PUBLIC_` 접두사 절대 금지)
- 보관 위치: `.env.local`(로컬) / Vercel Environment Variables(배포, Production 스코프만)
- 노출 범위: Server Only — Route Handler 내부에서만 생성하는 별도 Supabase 클라이언트에 한정, 기존 `createSupabaseServerClient()`(anon key 기반)와는 별도 함수로 분리
- 필수 가드: 삭제 대상 user id는 클라이언트 입력이 아니라 **서버가 현재 세션에서 직접 추출**한 값만 사용(타인 계정 삭제 방지)

### Acceptance Criteria 후보

- Given 로그인한 사용자, When 마이페이지에서 탈퇴 다이얼로그를 열고 본인 닉네임을 정확히 입력하면, Then "탈퇴하기" 버튼이 활성화된다
- Given 탈퇴 다이얼로그, When 닉네임을 잘못 입력하면, Then 버튼이 비활성 상태를 유지한다
- Given 활성화된 "탈퇴하기" 버튼, When 클릭하면, Then 계정이 `auth.users`에서 삭제되고 로그아웃 상태로 홈으로 이동한다
- Given 탈퇴 완료 후, When 같은 이메일로 다시 로그인을 시도하면, Then 계정이 존재하지 않아 로그인에 실패한다
- Given 탈퇴한 사용자가 관리자였고 템플릿을 등록한 상태, When 탈퇴가 완료되면, Then 그 템플릿들도 cascade로 함께 삭제된다

## Definition of Done 추가 항목 (기능 3, service_role 도입에 따른 보안 체크리스트)

- [ ] `SUPABASE_SERVICE_ROLE_KEY`가 `.env.example`에 플레이스홀더로만 문서화됨(실값 없음)
- [ ] 클라이언트 번들에 `SUPABASE_SERVICE_ROLE_KEY`가 포함되지 않음(grep으로 확인)
- [ ] 삭제 Route Handler가 세션에서 추출한 user id만 사용하고, 요청 body로 받은 id를 신뢰하지 않음
- [ ] `.gitignore`에 `.env.local`이 포함되어 있음(기존 확인됨, 재확인만)

## Out of Scope (이번 버전에서 하지 않음)

- 프로필(닉네임 외) 정보 표시/수정 — 이메일 표시, 비밀번호 변경 등
- 활동 내역(작성한 템플릿, 최근 방문 등) — 북마크 외 다른 활동 데이터
- 알림/설정 탭
- 탈퇴 시 "일정 기간 후 완전 삭제" 같은 유예 정책 — 즉시 완전 삭제만 지원
