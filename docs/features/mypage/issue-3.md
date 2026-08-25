# Issue #32 — 회원 탈퇴

GitHub: https://github.com/psy0821-k/frontend-starter-kit/issues/32
PRD: [prd.md](./prd.md) · 확정 스펙: [spec-fixed.md](./spec-fixed.md) §기술 결정 — Service Role Key 도입

## 시그니처

### service_role 전용 클라이언트 — `src/shared/api/supabase/admin.ts`

```typescript
/**
 * SUPABASE_SERVICE_ROLE_KEY로 생성하는 관리자 권한 Supabase 클라이언트.
 * 이 모듈은 /api/mypage/withdraw/route.ts에서만 import한다 — 다른 곳에서 사용 금지.
 * createSupabaseServerClient()(anon key 전용)와 별도로 존재한다.
 */
export function createSupabaseAdminClient(): SupabaseClient;
```

### 환경변수 — `src/shared/config/env.ts`

```typescript
// envSchema에 추가
SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
// NEXT_PUBLIC_ 접두사 없음 — 서버 전용, 클라이언트 번들에 노출되지 않음
```

### 회원 탈퇴 Route Handler — `src/app/api/mypage/withdraw/route.ts`

```typescript
// DELETE /api/mypage/withdraw   body 없음   → ApiResponse<null>
//   - 비로그인이면 401 AUTH_REQUIRED
//   - 삭제 대상 user id는 요청 body가 아니라 anon 클라이언트(createSupabaseServerClient)의
//     getUser()로 서버가 직접 추출한다 — 클라이언트가 다른 사용자의 id를 보낼 수 없게 한다.
//   - admin.deleteUser(userId)는 createSupabaseAdminClient()로만 호출한다.
export async function DELETE(request: Request): Promise<NextResponse>;
```

**에러 케이스**

| 조건                               | 에러                                   |
| ---------------------------------- | -------------------------------------- |
| 비로그인                           | `ApiError(401, 'AUTH_REQUIRED', ...)`  |
| `SUPABASE_SERVICE_ROLE_KEY` 미설정 | `ApiError(500, 'INTERNAL_ERROR', ...)` |
| `admin.deleteUser` 실패            | `ApiError(502, 'UPSTREAM_ERROR', ...)` |

### 탈퇴 확인 다이얼로그 — `src/features/mypage/ui/withdraw-dialog.tsx`

```typescript
interface WithdrawDialogProps {
  currentNickname: string;
}

export function WithdrawDialog(props: WithdrawDialogProps): JSX.Element;
```

- 입력값이 `currentNickname`과 정확히 일치할 때만 "탈퇴하기" 버튼이 활성화된다.
- 성공 시 `/api/auth/logout` 호출 없이 바로 홈(`/`)으로 리다이렉트 — 계정 자체가 삭제되어
  세션도 함께 무효화되므로 별도 로그아웃 API 호출이 불필요하다(단, 실제 동작은 Green 단계에서
  세션 쿠키가 자동 만료되는지 검증하고, 필요 시 로그아웃 호출을 추가한다).

## 설명

`/mypage`에 "회원 탈퇴" 섹션을 추가한다. 이번 이슈에서 이 프로젝트 최초로 `service_role` 키를
도입한다 — 반드시 `src/shared/api/supabase/admin.ts` 모듈로 격리하고, 이 Route Handler
바깥에서는 절대 import하지 않는다. 삭제 대상 user id는 세션에서 서버가 직접 추출하며,
클라이언트가 전달한 id를 신뢰하지 않는다(타인 계정 삭제 방지).

## 변경 지점

- `.env.example` — `SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY` 추가
- `src/shared/config/env.ts` — 환경변수 스키마에 추가
- `src/shared/api/supabase/admin.ts` — 신규
- `src/app/api/mypage/withdraw/route.ts` — 신규
- `src/features/mypage/ui/withdraw-dialog.tsx` — 신규
- `src/app/mypage/page.tsx` — `WithdrawDialog` 배치(수정)

## Acceptance Criteria

- [ ] Given 로그인한 사용자, When 마이페이지에서 탈퇴 다이얼로그를 열고 본인 닉네임을 정확히 입력하면, Then "탈퇴하기" 버튼이 활성화된다.
- [ ] Given 탈퇴 다이얼로그, When 닉네임을 잘못 입력하면, Then 버튼이 비활성 상태를 유지한다.
- [ ] Given 활성화된 "탈퇴하기" 버튼, When 클릭하면, Then 계정이 `auth.users`에서 삭제되고 로그아웃 상태로 홈으로 이동한다.
- [ ] Given 탈퇴 완료 후, When 같은 이메일로 다시 로그인을 시도하면, Then 계정이 존재하지 않아 로그인에 실패한다.
- [ ] Given 탈퇴한 사용자가 관리자였고 템플릿을 등록한 상태, When 탈퇴가 완료되면, Then 그 템플릿들도 cascade로 함께 삭제된다.
- [ ] Given `/api/mypage/withdraw` 요청, When 요청 body에 다른 사용자의 id를 실어 보내도, Then 서버는 이를 무시하고 오직 현재 세션의 사용자만 삭제한다.

## Definition of Done (보안 체크리스트, spec-fixed.md에서 이관)

- [ ] `SUPABASE_SERVICE_ROLE_KEY`가 `.env.example`에 플레이스홀더로만 문서화됨(실값 없음)
- [ ] 클라이언트 번들에 `SUPABASE_SERVICE_ROLE_KEY`가 포함되지 않음(grep으로 확인)
- [ ] 삭제 Route Handler가 세션에서 추출한 user id만 사용하고, 요청 body로 받은 id를 신뢰하지 않음
- [ ] `.gitignore`에 `.env.local`이 포함되어 있음(기존 확인됨, 재확인만)

## 의존성

이슈 1(`/mypage` 라우트, 인증 가드, `currentNickname` 표시) — 그 골격 위에 섹션을 추가한다.
이슈 2와는 독립적이라 순서를 바꿔도 무방하지만, spec-fixed.md에서 정한 우선순위(닉네임 변경 →
북마크 삭제 → 회원 탈퇴)를 따라 마지막에 진행한다.

## 테스트 시나리오

시그니처는 검증 결과 그대로 유효하다(아래 "시그니처 검증 근거" 참조). AC 6개를 정상/경계/예외로
분류해 시나리오를 도출했다.

### `WithdrawDialog` (`src/features/mypage/ui/withdraw-dialog.tsx`)

**정상**

1. 다이얼로그를 열고 입력값이 `currentNickname`과 정확히 일치할 때, "탈퇴하기" 버튼이
   활성화되어야 한다. (AC 1)
2. 활성화된 "탈퇴하기" 버튼을 클릭하면 `DELETE /api/mypage/withdraw`를 호출하고, 성공 시
   홈(`/`)으로 리다이렉트해야 한다. (AC 3)

**경계**

3. 입력값이 비어 있을 때, "탈퇴하기" 버튼이 비활성 상태를 유지해야 한다. (AC 2의 부분집합 —
   "빈 문자열도 불일치"라는 최소 경계)
4. 입력값이 `currentNickname`과 대소문자/공백만 다를 때(예: 끝에 공백 추가), 버튼이 비활성
   상태를 유지해야 한다 — 정확히 일치(exact match)만 허용하고 trim이나 대소문자 무시 비교를
   하지 않는다. (AC 2 보강, 근거: "정확히 일치"라는 issue 문구를 가장 보수적으로 해석)

**예외**

5. 닉네임을 잘못 입력했을 때, "탈퇴하기" 버튼이 비활성 상태를 유지해야 한다. (AC 2)
6. `DELETE /api/mypage/withdraw` 호출이 실패하면(예: 502), 다이얼로그가 닫히지 않고 에러
   메시지를 표시해야 한다 — `delete-template-dialog.tsx`와 동일한 실패 처리 패턴을 따른다.
   (issue-3.md 원 시그니처에는 없던 항목이지만, 기존 대표 구현(`DeleteTemplateDialog`)의
   에러 처리 패턴과의 일관성을 위해 보강했다.)

### `DELETE /api/mypage/withdraw` (`src/app/api/mypage/withdraw/route.ts`)

**정상**

7. 로그인한 사용자가 요청하면, 세션에서 추출한 user id로 `admin.deleteUser`를 호출하고
   `auth.users`에서 계정을 삭제한 뒤 `{ success: true, data: null }`을 반환해야 한다. (AC 3)
8. 탈퇴한 사용자가 관리자였고 템플릿을 등록한 상태였다면, 탈퇴 완료 후 해당 템플릿들도
   cascade로 함께 삭제되어야 한다. (AC 5 — DB FK `ON DELETE CASCADE` 설정에 의존하는
   시나리오이므로, Route Handler 유닛 테스트가 아니라 `templates.created_by` FK 제약
   확인 또는 E2E/통합 레벨에서 검증한다. 유닛 테스트 레벨에서는 "admin.deleteUser 호출
   자체가 성공적으로 이뤄지는지"까지만 검증 가능하다.)
9. 탈퇴 완료 후 같은 이메일로 로그인을 시도하면 계정이 존재하지 않아 로그인에 실패해야
   한다. (AC 4 — 이 역시 Supabase Auth의 실제 삭제 결과에 의존하므로 통합/E2E 레벨
   시나리오다. Route Handler 유닛 테스트 레벨에서는 "admin.deleteUser가 올바른 user id로
   호출됐는지"까지 검증한다.)

**경계**

10. 요청 body에 다른 사용자의 id를 실어 보내도, 서버는 body를 파싱하지 않고 세션에서
    추출한 user id만 사용해야 한다 — `admin.deleteUser`가 body의 id가 아닌
    `getUser()`로 얻은 세션 user id로 호출됐는지 검증한다. (AC 6)

**예외**

11. 비로그인 상태로 요청하면 401 `AUTH_REQUIRED`를 반환해야 한다. (issue-3.md 에러 케이스 표)
12. `SUPABASE_SERVICE_ROLE_KEY`가 설정되지 않은 상태로 요청하면 500 `INTERNAL_ERROR`를
    반환해야 한다. (issue-3.md 에러 케이스 표 — env.ts에 스키마 추가가 선행되어야 검증 가능)
13. `admin.deleteUser` 호출 자체가 실패하면(Supabase 측 오류) 502 `UPSTREAM_ERROR`를
    반환해야 한다. (issue-3.md 에러 케이스 표)

### `createSupabaseAdminClient` (`src/shared/api/supabase/admin.ts`)

**예외**

14. `SUPABASE_SERVICE_ROLE_KEY`가 없을 때 `createSupabaseAdminClient()`를 호출하면 명시적
    에러를 던져야 한다 — `getSupabaseCredentials()`가 anon key 미설정 시 조용히 넘기지
    않고 에러를 던지는 기존 패턴(`config.ts`)과 동일하게, service_role key 미설정도
    조용히 넘기지 않는다.

## 시그니처 검증 근거

- `gh issue view 32`의 AC 6개와 `issue-3.md` 기존 시그니처를 대조한 결과, 시그니처 변경 없이
  그대로 AC를 커버한다. 시그니처를 수정하지 않았다.
- `src/shared/config/env.ts`를 확인한 결과 `SUPABASE_SERVICE_ROLE_KEY`는 아직 스키마에
  없다(현재는 `NEXT_PUBLIC_API_BASE_URL` / `NEXT_PUBLIC_SUPABASE_URL` /
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `NODE_ENV`만 존재). `.env.example`에도 없다. issue-3.md의
  `SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional()` 추가 계획이 유효하며, 시나리오 12는
  이 스키마 추가가 선행되어야 검증 가능하다.
- `src/shared/api/supabase/admin.ts`, `src/app/api/mypage/withdraw/route.ts`,
  `src/features/mypage/ui/withdraw-dialog.tsx` 모두 아직 파일이 존재하지 않아(신규 생성
  대상) 시그니처와 실제 코드 간 충돌이 없다.
- 코드베이스 전체에서 `SUPABASE_SERVICE_ROLE_KEY` / `deleteUser` / admin 클라이언트 관련
  코드를 검색한 결과 기존 참조가 전혀 없다 — 이슈 설명대로 이 프로젝트 최초의 service_role
  키 도입이 맞다.
- Dialog UI는 `delete-template-dialog.tsx`(AlertDialog 기반, 삭제 확인 + 에러 인라인 표시
  패턴)를 참조했으나, 그대로 재사용하지 않고 새로 만든다 — `AlertDialog`는 버튼 클릭 자체가
  확인 동작인 반면, `WithdrawDialog`는 텍스트 입력 일치가 활성화 조건이라 다른 상호작용
  모델이다. 에러 표시·다이얼로그 유지 정책만 동일 패턴을 따른다(시나리오 6).
- AC 5, 9는 DB cascade·Supabase Auth 실제 삭제 결과에 의존해 Route Handler 유닛 테스트만으로
  완전히 검증하기 어렵다 — Green 단계에서 유닛 테스트로 커버 가능한 범위(호출 인자 검증)와
  통합/E2E로 넘길 범위를 시나리오 8, 9의 괄호 안에 명시했다. 이는 시그니처를 바꾸는 것이
  아니라 검증 레벨을 명확히 하는 것이므로 STOP 사유가 아니라고 판단했다.
