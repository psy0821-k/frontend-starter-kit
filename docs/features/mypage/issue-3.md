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
