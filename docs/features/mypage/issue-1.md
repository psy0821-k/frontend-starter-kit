# Issue #30 — 마이페이지 기반 구축 + 닉네임 변경

GitHub: https://github.com/psy0821-k/frontend-starter-kit/issues/30
PRD: [prd.md](./prd.md) · 확정 스펙: [spec-fixed.md](./spec-fixed.md)

## 시그니처

### 닉네임 단일 소스화 — `src/shared/api/auth/get-current-user.ts`

```typescript
export async function getCurrentUser(): Promise<CurrentUser | null>;
// 기존: user.user_metadata?.nickname 사용
// 변경: auth.getUser() 이후 profiles.nickname을 추가 SELECT하여 사용
```

### 마이페이지 라우트 — `src/app/mypage/page.tsx`

```typescript
export default async function MyPage(): Promise<JSX.Element>;
// getCurrentUser()가 null이면 redirect('/auth/login')
```

### 헤더 진입점 — `src/app/_components/header.tsx`

```typescript
// 기존: <span>{user.nickname}님</span><LogoutButton />
// 변경: <span>{user.nickname}님</span><Link href="/mypage">마이페이지</Link><LogoutButton />
// 닉네임 텍스트는 그대로 두고, 로그인 사용자 메뉴 영역에 "마이페이지" 링크를 새 항목으로 추가한다.
```

### 닉네임 변경 Route Handler — `src/app/api/mypage/nickname/route.ts`

```typescript
// PATCH /api/mypage/nickname   body: { nickname: string }   → ApiResponse<{ nickname: string }>
//   - 비로그인이면 401 AUTH_REQUIRED
//   - nicknameSchema(2~20자) 위반 시 400 VALIDATION_ERROR
//   - 중복 닉네임이면 409 CONFLICT
export async function PATCH(request: Request): Promise<NextResponse>;
```

**에러 케이스**

| 조건                     | 에러                                     |
| ------------------------ | ---------------------------------------- |
| 비로그인                 | `ApiError(401, 'AUTH_REQUIRED', ...)`    |
| 닉네임 형식 위반(2~20자) | `ApiError(400, 'VALIDATION_ERROR', ...)` |
| 이미 사용 중인 닉네임    | `ApiError(409, 'CONFLICT', ...)`         |
| UPDATE 실패(그 외)       | `ApiError(502, 'UPSTREAM_ERROR', ...)`   |

### 닉네임 변경 UI — `src/features/mypage/ui/nickname-form.tsx`

```typescript
interface NicknameFormProps {
  currentNickname: string;
}

export function NicknameForm(props: NicknameFormProps): JSX.Element;
```

- 기존 `useNicknameAvailability` 훅(`src/features/auth/lib/use-nickname-availability.ts`)을
  그대로 재사용해 입력 중 중복 여부를 실시간으로 보여준다.
- 저장 성공 시 `router.refresh()`로 헤더의 닉네임 표시를 갱신한다(기존 `LogoutButton`의
  `router.refresh()` 패턴과 동일).
- 현재 닉네임과 동일한 값을 그대로 제출하면 클라이언트에서 API 호출 없이 조용히 무시한다
  (변경 사항 없음이므로 서버 왕복이 불필요).

## 설명

이번 이슈는 마이페이지의 최초 골격(라우트, 인증 가드, 진입점)을 만들고, 첫 액션 기능인
"닉네임 변경"을 완성한다. 이슈가 끝나면 로그인한 사용자가 헤더에서 마이페이지로 들어가
자기 닉네임을 바꿀 수 있다(사용자에게 보이는 완결된 동작). 후속 이슈(북마크 삭제, 회원
탈퇴)는 이 라우트/페이지 골격 위에 섹션을 추가하는 방식으로 진행한다.

## 변경 지점

- `src/shared/api/auth/get-current-user.ts` — `profiles.nickname` 추가 조회로 수정
- `src/app/mypage/page.tsx` — 신규. 인증 가드 + `NicknameForm` 배치
- `src/app/_components/header.tsx` — 로그인 사용자 메뉴에 "마이페이지" 링크 신규 추가
- `src/app/api/mypage/nickname/route.ts` — 신규. PATCH, 중복 검사 + `profiles` UPDATE
- `src/features/mypage/ui/nickname-form.tsx` — 신규
- `src/features/mypage/model/schema.ts` — 신규. 기존 `nicknameSchema` re-export 또는 그대로 import

## Acceptance Criteria

- [ ] Given 로그인한 사용자, When 헤더의 "마이페이지" 메뉴 항목을 클릭하면, Then `/mypage`로 이동한다.
- [ ] Given 비로그인 상태, When `/mypage`에 직접 접근하면, Then `/auth/login`으로 리다이렉트된다.
- [ ] Given 로그인한 사용자가 마이페이지에 있을 때, When 사용 가능한 새 닉네임을 입력하고 저장하면, Then `profiles.nickname`이 갱신되고 헤더 표시도 새 닉네임으로 바뀐다.
- [ ] Given 이미 사용 중인 닉네임, When 그 값으로 저장을 시도하면, Then 에러가 표시되고 저장되지 않는다.
- [ ] Given 2자 미만 또는 20자 초과 닉네임, When 저장을 시도하면, Then 유효성 에러가 표시되고 API 요청이 발생하지 않는다.
- [ ] Given 현재와 동일한 닉네임, When 그대로 저장을 시도하면, Then API 요청 없이 조용히 처리된다(에러 아님).

## 의존성

없음 — 선행 이슈. 이후 이슈(북마크 삭제, 회원 탈퇴)가 여기서 만든 `/mypage` 페이지 골격에
섹션을 추가하는 형태로 이어진다.
