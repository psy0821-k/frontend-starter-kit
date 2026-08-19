# Issue #13 — Supabase 연동 기반 구축: 시그니처 & 테스트 시나리오

**GitHub 이슈**: [#13](https://github.com) "[auth] Supabase 연동 기반 구축"
**원본 이슈 문서**: [issue-01-supabase-setup.md](./issue-01-supabase-setup.md)
**관련 PRD**: [prd.md](./prd.md) §기술 결정 "Supabase 연동 구조 — BFF 경유", §Security Impact

## 배경 요약

작업 범위의 산출물은 이미 코드베이스에 구현되어 있다. 이번 이슈의 실질 작업은 **테스트 공백을
메우는 것**이다.

| 파일                                   | 구현 상태 | 테스트 상태                               |
| -------------------------------------- | --------- | ----------------------------------------- |
| `src/shared/config/env.ts`             | 구현됨    | `env.test.ts` 존재 (커버 확인, 아래 참조) |
| `src/shared/api/supabase/config.ts`    | 구현됨    | **없음 — 이번 이슈의 핵심 신규 작업**     |
| `src/shared/api/supabase/server.ts`    | 구현됨    | 없음 — 범위 밖으로 판단 (근거는 하단)     |
| `src/shared/api/supabase/map-error.ts` | 구현됨    | `map-error.test.ts` 존재 (커버 확인)      |
| `.env.example`                         | 구현됨    | 해당 없음 (설정 파일)                     |

## 확정 시그니처

기존 구현을 그대로 문서화한다 (변경 없음).

### `src/shared/config/env.ts`

```ts
export const env: {
  NEXT_PUBLIC_API_BASE_URL: string | undefined;
  NEXT_PUBLIC_SUPABASE_URL: string | undefined;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string | undefined;
  NODE_ENV: 'development' | 'production' | 'test';
};
```

모듈 로드 시점에 `envSchema.parse(process.env)`를 실행하고, 실패 시 `ZodError`를 그대로 throw한다
(Supabase 두 키는 `optional()`이므로 미설정으로는 실패하지 않음).

### `src/shared/api/supabase/config.ts`

```ts
interface SupabaseCredentials {
  url: string;
  anonKey: string;
}

function isSupabaseConfigured(): boolean;
function getSupabaseCredentials(): SupabaseCredentials; // 미설정 시 Error throw
```

### `src/shared/api/supabase/server.ts`

```ts
async function createSupabaseServerClient(): Promise<SupabaseClient>;
```

내부에서 `getSupabaseCredentials()` 호출 → 실패 시 그 에러가 그대로 전파(별도 catch 없음) →
`await cookies()` (Next.js Route Handler 컨텍스트 필요) → `createServerClient(url, anonKey, {...})`.

### `src/shared/api/supabase/map-error.ts`

```ts
function mapSupabaseAuthError(error: AuthError): ApiError;
```

`SUPABASE_ERROR_CODE_MAP`(미노출 상수)로 코드를 매핑하고, 테이블에 없으면
`ApiErrorCode.INTERNAL_ERROR` + `status: 500`으로 흡수한다.

## 기존 테스트가 이미 커버한 범위 (중복 작성 금지)

**`env.test.ts`** (`src/shared/config/env.test.ts`):

- `NEXT_PUBLIC_SUPABASE_URL`이 URL 형식이 아니면 부팅 시점에 실패
- Supabase 두 변수 모두 미설정이어도 정상 로드(`undefined`로 노출)
- Supabase 두 변수가 유효하게 설정되면 정상 로드되고 값을 그대로 노출

**`map-error.test.ts`** (`src/shared/api/supabase/map-error.test.ts`):

- `user_already_exists`, `email_exists` → `CONFLICT`
- `weak_password` → `VALIDATION_ERROR`
- `invalid_credentials` → `INVALID_CREDENTIALS`
- `email_not_confirmed` → `EMAIL_NOT_VERIFIED`
- 매핑 테이블에 없는 코드 → `INTERNAL_ERROR` + status 500

## AC 대조표

| AC                                                                            | 커버 상태                                                               |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| AC-1: 환경변수 미설정 상태에서도 앱이 정상 부팅                               | `env.test.ts` 기존 케이스로 이미 커버 (아래 §AC-1 판단 근거)            |
| AC-2: 미설정 상태에서 `getSupabaseCredentials()`가 명확한 에러 throw          | **신규 시나리오 필요** (`config.test.ts`)                               |
| AC-3: 미설정 상태에서 `isSupabaseConfigured()`가 `false` 반환                 | **신규 시나리오 필요** (`config.test.ts`)                               |
| AC-4: 설정된 상태에서 부팅 정상 + `getSupabaseCredentials()`가 값 그대로 반환 | 부팅 부분은 `env.test.ts`로 커버, 값 반환 부분은 **신규 시나리오 필요** |
| AC-5: `user_already_exists` → `ApiErrorCode.CONFLICT`                         | `map-error.test.ts` 기존 케이스로 이미 커버                             |
| AC-6: 매핑 테이블에 없는 코드 → `INTERNAL_ERROR`(500)                         | `map-error.test.ts` 기존 케이스로 이미 커버                             |

→ 신규로 작성해야 하는 파일은 `src/shared/api/supabase/config.test.ts` 하나뿐이다.

### AC-1 판단 근거

"앱을 부팅한다"를 유닛 테스트로 직접 재현하는 것(예: Next.js 앱 전체 기동)은 이 이슈 범위에서
과도하다고 판단한다. `env.ts`는 모듈 로드 시점에 `envSchema.parse()`를 실행하는 구조이므로,
"모듈을 import했을 때 에러 없이 로드되는가"가 곧 "부팅 시 실패하지 않는가"와 동치다.
`env.test.ts`의 "Supabase 환경변수가 미설정(optional)이어도 정상 로드된다" 케이스가 이미 이
동치 관계로 AC-1을 검증하고 있으므로 별도 E2E나 추가 유닛 테스트를 만들지 않는다.

### `server.ts` 테스트 범위 판단

`createSupabaseServerClient`는 Next.js `cookies()` API(Route Handler/Server Component 컨텍스트
전용)에 의존한다. 이 함수를 유닛 테스트로 검증하려면 `next/headers`의 `cookies`를 모킹해야
하는데, 그 경우 실제로 검증되는 것은 "모킹된 함수가 모킹된 값을 반환한다"는 사실뿐이라 테스트
가치가 낮고(취약한 테스트), `getSupabaseCredentials()` 호출 위임이라는 유일하게 의미 있는 로직은
이미 `config.test.ts`에서 `getSupabaseCredentials()` 자체를 직접 검증하는 것으로 충분히
커버된다. 실제로 `route.test.ts`(`src/app/api/auth/register/route.test.ts`)가
`createSupabaseServerClient`를 통째로 `vi.mock`으로 대체하는 것도 같은 판단을 뒷받침하는
기존 패턴이다. 이번 이슈에서 `server.ts`에 대한 별도 유닛 테스트는 작성하지 않는다 — AC 6개
중 `server.ts`를 직접 겨냥하는 AC는 없으므로(AC-2/AC-5/AC-6은 각각 `getSupabaseCredentials`,
`mapSupabaseAuthError`를 직접 겨냥) 미검증으로 인한 갭도 없다.

## 신규 테스트 시나리오 — `src/shared/api/supabase/config.test.ts`

기존 `env.test.ts` 패턴(‘process.env를 직접 변경 후 `vi.resetModules()` + 동적 `import()`로
모듈을 다시 로드’)을 그대로 따른다. `config.ts`가 `env.ts`의 모듈 레벨 상수를 import하므로,
`vi.mock`으로 `env`를 대체하는 대신 동일하게 `process.env`를 조작하고 두 모듈을 함께
동적으로 재로드한다.

### `isSupabaseConfigured`

1. **[정상] should return false when both Supabase env vars are unset**
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 둘 다 미설정 → `false` 반환,
   에러를 던지지 않음. (AC-3)

2. **[경계] should return false when only one Supabase env var is set**
   URL만 설정되고 anonKey는 미설정(또는 그 반대) → `false` 반환. (AC-3의 경계 케이스 — "또는"
   조건을 명시적으로 검증)

3. **[정상] should return true when both Supabase env vars are set**
   둘 다 유효하게 설정 → `true` 반환. (AC-4의 전제 조건 검증)

### `getSupabaseCredentials`

4. **[예외] should throw a descriptive error when Supabase env vars are unset**
   둘 다 미설정 상태에서 호출 → 에러를 던지고, 에러 메시지에 어떤 값이 누락됐는지 알 수 있는
   안내가 포함되어 있음을 확인(`NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` 키
   이름 또는 `.env.local` 안내 문구 포함 여부로 검증). (AC-2)

5. **[정상] should return the configured url and anonKey when both env vars are set**
   둘 다 유효하게 설정된 상태에서 호출 → `{ url, anonKey }`를 설정된 값 그대로 반환.
   (AC-4의 `getSupabaseCredentials()` 부분)

## 요약

- 확정 시그니처: `env`(상수), `isSupabaseConfigured()`, `getSupabaseCredentials()`,
  `createSupabaseServerClient()`, `mapSupabaseAuthError()` — 5개 모두 이미 구현된 시그니처를
  그대로 사용, 신규/변경 없음.
- 신규 작성 대상은 `src/shared/api/supabase/config.test.ts` 1개 파일, 시나리오 5개.
- AC 6/6 커버 (`server.ts`에 대한 별도 유닛 테스트는 의도적으로 범위 밖 — 근거는 위 §`server.ts`
  테스트 범위 판단 참조, 이를 겨냥하는 AC 자체가 없음).
