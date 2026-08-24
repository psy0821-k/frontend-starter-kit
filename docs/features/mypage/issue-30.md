# Issue #30 — 마이페이지 기반 구축 + 닉네임 변경

GitHub: https://github.com/psy0821-k/frontend-starter-kit/issues/30
PRD: [prd.md](./prd.md) · 확정 스펙: [spec-fixed.md](./spec-fixed.md) · 이전 초안: [issue-1.md](./issue-1.md)

## 시그니처

### 1. 닉네임 단일 소스화 — `src/shared/api/auth/get-current-user.ts`

```typescript
interface CurrentUser {
  id: string;
  nickname: string;
}

export async function getCurrentUser(): Promise<CurrentUser | null>;
```

- 기존: `user.user_metadata?.nickname` 사용 (현재 코드 확인됨 — 이슈가 지적한 불일치의 실체).
- 변경: `auth.getUser()`로 세션 확인 후 `profiles` 테이블에서 `nickname`을 추가 SELECT하여 사용.
- `profiles`에서 값을 찾지 못하면(행 없음 등) 기존과 동일하게 `user.email ?? ''`로 폴백한다
  (기존 코드의 `typeof nickname === 'string' ? nickname : (user.email ?? '')` 폴백 관례를 유지).
- `isSupabaseConfigured()`가 false면 기존과 동일하게 `null` 반환(변경 없음).

### 2. 마이페이지 라우트 — `src/app/mypage/page.tsx`

```typescript
export default async function MyPage(): Promise<JSX.Element>;
```

- 서버 컴포넌트. `getCurrentUser()`가 `null`이면 `redirect('/auth/login')`
  (`requireAdmin`이 아니라 `getCurrentUser`를 쓰는 이유: 이 페이지는 관리자 전용이 아니라
  로그인한 일반 사용자 전용이므로 `templates/new/page.tsx`의 `requireAdmin` 가드가 아닌
  `getCurrentUser` + 수동 리다이렉트 조합을 쓴다).
- `NicknameForm currentNickname={user.nickname}`을 배치한다.

### 3. 헤더 진입점 — `src/app/_components/header.tsx`

```typescript
// 기존: <span>{user.nickname}님</span><LogoutButton />
// 변경: <span>{user.nickname}님</span><Link href="/mypage" className={linkClassName}>마이페이지</Link><LogoutButton />
```

- 닉네임 텍스트(`{user.nickname}님`)는 그대로 두고, 로그인 사용자 메뉴 영역(`user ? (...) : (...)`
  분기의 `<div className="flex items-center gap-3">` 내부)에 "마이페이지" `<Link>`를 새 항목으로 추가한다.
- 기존 헤더 링크와 동일하게 `linkClassName`(포커스 아웃라인 공통 스타일)을 재사용한다.

### 4. 닉네임 변경 Route Handler — `src/app/api/mypage/nickname/route.ts`

```typescript
export async function PUT(request: Request): Promise<NextResponse>;
```

- **PATCH가 아니라 PUT을 쓴다.** 근거: `src/app/api/templates/[id]/route.ts`의 기존 주석에
  "apiClient에 patch 메서드가 없다는 점과도 맞습니다"라고 명시돼 있고, 실제
  `src/shared/api/client.ts`(`ApiClient`)에도 `get/post/put/delete`만 있고 `patch`가 없음을
  확인했다. 이슈-1.md 초안은 PATCH를 제안했으나 이는 코드베이스 검증 결과와 어긋나므로
  기각한다. 닉네임 변경은 단일 필드 전체 교체라 PUT의 "전체 교체" 의미론과도 자연스럽게
  맞는다. 이슈 30의 AC 문구는 HTTP 메서드를 지정하지 않으므로 이 선택은 AC와 충돌하지 않는다.
- Request body: `{ nickname: string }`
- 응답: `ApiResponse<{ nickname: string }>` (성공 시 `{ success: true, data: { nickname } }`,
  실패 시 `toErrorResponse(error)`가 만드는 표준 envelope)
- 처리 흐름(`bookmarks/route.ts` POST와 동일한 try/catch + `toErrorResponse` 골격을 따른다):
  1. `getCurrentUser()`가 `null`이면 `ApiError(401, 'AUTH_REQUIRED', ...)`
  2. `nicknameSchema.safeParse(body.nickname)` 실패 시 `ApiError(400, 'VALIDATION_ERROR', ...)`
  3. `profiles` 테이블에서 동일 `nickname` 존재 여부 조회(`check-nickname` route와 동일한
     `.eq('nickname', ...).maybeSingle()` 쿼리) → 존재하면 `ApiError(409, 'CONFLICT', ...)`
     (단, 존재하는 행이 본인의 기존 행이면 충돌이 아니다 — 아래 "동일 닉네임" 처리 참고)
  4. `profiles` UPDATE 실패(그 외 DB 에러) 시 `ApiError(502, 'UPSTREAM_ERROR', ...)`
  5. 성공 시 `{ success: true, data: { nickname } }`

**에러 케이스**

| 조건                             | 에러                                     |
| -------------------------------- | ---------------------------------------- |
| 비로그인                         | `ApiError(401, 'AUTH_REQUIRED', ...)`    |
| 닉네임 형식 위반(2~20자)         | `ApiError(400, 'VALIDATION_ERROR', ...)` |
| 이미 사용 중인 닉네임(타인 소유) | `ApiError(409, 'CONFLICT', ...)`         |
| UPDATE 실패(그 외 DB 에러)       | `ApiError(502, 'UPSTREAM_ERROR', ...)`   |

### 5. 닉네임 변경 클라이언트 API — `src/features/mypage/api/update-nickname.ts`

```typescript
export async function updateNickname(nickname: string): Promise<string>;
```

- `src/features/starter-kit/api/update-template.ts` 패턴을 따른다: `apiClient.put<ApiResponse<{ nickname: string }>>('/api/mypage/nickname', { nickname })` 호출 후
  `response.data`가 없으면 `ApiError(500, 'INTERNAL_ERROR', '수정 결과를 확인하지 못했습니다')`를 던지고,
  있으면 `response.data.nickname`을 반환한다.

### 6. 닉네임 변경 UI — `src/features/mypage/ui/nickname-form.tsx`

```typescript
interface NicknameFormProps {
  currentNickname: string;
}

export function NicknameForm(props: NicknameFormProps): JSX.Element;
```

- 기존 `useNicknameAvailability` 훅(`src/features/auth/lib/use-nickname-availability.ts`)을
  그대로 재사용해 입력 중 중복 여부를 실시간으로 보여준다.
- 제출 시 입력값이 `currentNickname`과 동일하면(trim 비교 없이 문자열 그대로 비교 —
  기존 `nicknameSchema`가 trim을 하지 않으므로 동일 기준 유지) `updateNickname` 호출 없이
  조용히 종료한다(AC: "API 요청 없이 조용히 처리 — 에러 아님").
- 값이 다르면 `updateNickname(nickname)` 호출. 성공 시 `LogoutButton`과 동일한
  `router.refresh()` 패턴으로 헤더의 닉네임 표시를 갱신한다.
- `ApiError` catch 시 `code`에 따라 사용자 메시지 표시(409 → "이미 사용 중인 닉네임입니다" 등
  서버 메시지를 그대로 노출, 별도 매핑 불필요 — 서버가 이미 사용자 지향 메시지를 준다).

### 7. mypage 스키마 — `src/features/mypage/model/schema.ts`

```typescript
export { nicknameSchema } from '@/features/auth/model/schema';
```

- 새 스키마를 만들지 않고 기존 `nicknameSchema`를 re-export한다(DRY, "2회 규칙" —
  동일 검증 로직이 이미 auth에 있으므로 새로 만들지 않음).

## 설명

마이페이지의 최초 골격(라우트, 인증 가드, 진입점)을 만들고, 첫 액션 기능인 "닉네임 변경"을
완성한다. 이슈가 끝나면 로그인한 사용자가 헤더에서 마이페이지로 들어가 자기 닉네임을 바꿀 수
있다. 후속 이슈(북마크 삭제, 회원 탈퇴)는 이 라우트/페이지 골격 위에 섹션을 추가하는 방식으로
진행한다.

## 변경 지점

- `src/shared/api/auth/get-current-user.ts` — `profiles.nickname` 추가 조회로 수정
- `src/app/mypage/page.tsx` — 신규. 인증 가드 + `NicknameForm` 배치
- `src/app/_components/header.tsx` — 로그인 사용자 메뉴에 "마이페이지" 링크 신규 추가
- `src/app/api/mypage/nickname/route.ts` — 신규. PUT, 중복 검사 + `profiles` UPDATE
- `src/features/mypage/api/update-nickname.ts` — 신규. `updateTemplate` 패턴을 따르는 BFF 호출 함수
- `src/features/mypage/ui/nickname-form.tsx` — 신규(기존 `useNicknameAvailability` 재사용)
- `src/features/mypage/model/schema.ts` — 신규. 기존 `nicknameSchema` re-export

## 자율 판단 근거 요약

- **PUT vs PATCH**: issue-1.md 초안은 PATCH였으나, 코드베이스에 실제 PATCH 사용례가 없고
  `apiClient`에 patch 메서드 자체가 없음을 확인해 PUT으로 변경. 기존 `templates/[id]/route.ts`
  주석이 이 판단의 직접적 근거.
- **동일 닉네임 처리 위치**: AC는 "동일 닉네임이면 API 요청 없이 조용히 처리"라고 명시하므로,
  이 판단은 클라이언트(`NicknameForm`)에서 제출 전에 걸러야 한다(서버까지 안 감). 가장 좁은
  해석 — "요청 자체가 발생하지 않는다"를 그대로 구현 지점으로 확정.
- **route handler에서의 "본인의 기존 닉네임과 동일" 케이스**: 클라이언트에서 이미 걸러지므로
  서버 쪽 중복 검사(`profiles.nickname` 조회)는 "타인이 이미 쓰는 닉네임"만 409로 본다.
  다만 클라이언트 검증을 우회한 직접 API 호출 시에도 본인 현재 닉네임과 동일한 값을 보내면
  DB 조회 결과가 본인 행일 수 있으므로, 서버 구현 시 조회된 행의 `id`(또는 `user_id`)가
  현재 사용자 자신이면 409가 아니라 정상 처리(UPDATE 그대로 진행, 실질적으로 no-op)로
  다뤄야 한다 — 이 규칙은 시나리오에도 별도로 반영한다.

## 테스트 시나리오

### `getCurrentUser`

- [정상] `getCurrentUser` — should return CurrentUser with profiles.nickname when session exists and profiles row exists
- [경계] `getCurrentUser` — should fall back to user.email when profiles row has no nickname
- [예외] `getCurrentUser` — should return null when no session exists
- [예외] `getCurrentUser` — should return null when Supabase is not configured

### `MyPage` (`src/app/mypage/page.tsx`)

- [정상] `MyPage` — should render NicknameForm with currentNickname when user is logged in
- [예외] `MyPage` — should redirect to /auth/login when user is not logged in

### `Header`

- [정상] `Header` — should render "마이페이지" link pointing to /mypage when user is logged in
- [정상] `Header` — should keep rendering "{nickname}님" text unchanged alongside the new link
- [경계] `Header` — should not render "마이페이지" link when user is not logged in

### `PUT /api/mypage/nickname`

- [정상] `PUT /api/mypage/nickname` — should update profiles.nickname and return the new nickname when the new nickname is available
- [경계] `PUT /api/mypage/nickname` — should update successfully (no-op semantics) when the submitted nickname equals the caller's own current nickname
- [예외] `PUT /api/mypage/nickname` — should return 401 AUTH_REQUIRED when the caller is not logged in
- [예외] `PUT /api/mypage/nickname` — should return 400 VALIDATION_ERROR when nickname is shorter than 2 characters
- [예외] `PUT /api/mypage/nickname` — should return 400 VALIDATION_ERROR when nickname is longer than 20 characters
- [예외] `PUT /api/mypage/nickname` — should return 409 CONFLICT when nickname is already used by another user
- [예외] `PUT /api/mypage/nickname` — should return 502 UPSTREAM_ERROR when the profiles UPDATE fails for a reason other than uniqueness

### `updateNickname` (`src/features/mypage/api/update-nickname.ts`)

- [정상] `updateNickname` — should return the updated nickname when the PUT request succeeds
- [예외] `updateNickname` — should throw ApiError(500, 'INTERNAL_ERROR') when response.data is missing
- [예외] `updateNickname` — should propagate ApiError when the PUT request fails (e.g. 409 CONFLICT)

### `NicknameForm`

- [정상] `NicknameForm` — should call updateNickname and router.refresh() when a new available nickname is submitted
- [경계] `NicknameForm` — should not call updateNickname when the submitted nickname equals currentNickname
- [예외] `NicknameForm` — should show a validation error and not call updateNickname when nickname length is out of range (2~20자)
- [예외] `NicknameForm` — should show an error message and not update the header when updateNickname rejects with ApiError(409, 'CONFLICT')
- [정상] `NicknameForm` — should show real-time availability status via useNicknameAvailability while typing

## AC 커버리지 대조

| AC                                                                      | 커버 시나리오                                                                                                                                         |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 헤더 "마이페이지" 클릭 시 `/mypage`로 이동                              | `Header` — should render "마이페이지" link pointing to /mypage when user is logged in                                                                 |
| 비로그인 `/mypage` 접근 시 `/auth/login` 리다이렉트                     | `MyPage` — should redirect to /auth/login when user is not logged in                                                                                  |
| 사용 가능한 새 닉네임 저장 시 `profiles.nickname` 갱신 + 헤더 표시 갱신 | `PUT /api/mypage/nickname` — should update profiles.nickname...; `NicknameForm` — should call updateNickname and router.refresh()...                  |
| 이미 사용 중인 닉네임으로 저장 시 에러 표시, 미저장                     | `PUT /api/mypage/nickname` — should return 409 CONFLICT...; `NicknameForm` — should show an error message... ApiError(409, 'CONFLICT')                |
| 2자 미만/20자 초과 시 유효성 에러, API 요청 미발생                      | `PUT /api/mypage/nickname` — should return 400 VALIDATION_ERROR (2건); `NicknameForm` — should show a validation error and not call updateNickname... |
| 현재와 동일한 닉네임 저장 시 API 요청 없이 조용히 처리                  | `NicknameForm` — should not call updateNickname when the submitted nickname equals currentNickname                                                    |

6개 AC 모두 최소 1개 이상의 시나리오로 커버됨 (6/6).
