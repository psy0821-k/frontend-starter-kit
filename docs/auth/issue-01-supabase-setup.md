# Issue 01 — Supabase 연동 기반 구축

**의존성**: 없음 (최초 이슈)
**관련 PRD**: [prd.md](./prd.md) §기술 결정 "Supabase 연동 구조 — BFF 경유", §Security Impact

**상태 갱신(2026-08-20)**: 작업 범위의 산출물(환경변수 검증, 서버 클라이언트, 에러 매핑 유틸,
`.env.example`)은 커밋 `fe36a8f`("Supabase 연동 가드 제거 및 env 검증 optional로 완화")까지
이미 코드베이스에 구현되어 있다. 다만 원래 AC-1("환경변수 미설정 시 부팅 시점 실패")은 그
커밋에서 의도적으로 뒤집혔다 — Supabase 프로젝트 연결 전에도 앱이 뜨고 mock 데이터로 화면을
확인할 수 있어야 한다는 이유로, 환경변수를 optional로 완화하고 실패 시점을 "부팅 시"에서
"실제 Supabase 호출 시"로 미뤘다(`getSupabaseCredentials()`가 호출 시점에 명확한 에러를 던짐).
아래 AC-1은 이 실제 아키텍처에 맞게 갱신됐다. 이번 이슈에서 남은 작업은 이 갱신된 AC들을
검증하는 테스트를 고정하는 것이다(구현 자체의 대규모 변경은 없음).

## 목표

Supabase 프로젝트와의 연결 기반(환경변수, 서버 클라이언트, 에러 매핑 유틸)을 갖춰, 이후 이슈들이 실제 Supabase 호출을 만들 수 있게 한다. 환경변수 미설정 상태에서도 앱은 정상 부팅되어야 하며(mock 데이터 확인 가능), 실제 Supabase를 호출하는 시점에만 설정 누락이 명확히 드러나야 한다.

## 작업 범위

- `src/shared/config/env.ts`에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` Zod 검증 추가 (optional)
- `.env.example`에 두 키 추가 (실제 값 없이 placeholder)
- `src/shared/api/supabase/config.ts` — `isSupabaseConfigured()`(설정 여부만 확인, 읽기/폴백용), `getSupabaseCredentials()`(미설정 시 명확한 에러를 던짐, 쓰기/인증용)
- `src/shared/api/supabase/server.ts` — Route Handler 전용 Supabase 서버 클라이언트 (Anon Key + 사용자 세션 기반, Service Role 미사용)
- Supabase 에러 → `ApiError`/`ApiErrorCode` 매핑 유틸 (`src/shared/api/supabase/map-error.ts`) — `user_already_exists` → `CONFLICT` 등 매핑 테이블

## Acceptance Criteria

- [ ] Given `NEXT_PUBLIC_SUPABASE_URL` 또는 `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 설정되지 않은 상태, When 앱을 부팅하면, Then 정상적으로 부팅된다(환경변수 검증 자체는 optional이므로 실패하지 않는다)
- [ ] Given `NEXT_PUBLIC_SUPABASE_URL` 또는 `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 설정되지 않은 상태, When `getSupabaseCredentials()`가 호출되면(예: Route Handler에서 Supabase 서버 클라이언트를 만들려는 시점), Then 어떤 값이 누락됐는지 알 수 있는 명확한 에러를 던진다
- [ ] Given 두 환경변수가 설정되지 않은 상태, When `isSupabaseConfigured()`를 호출하면, Then `false`를 반환한다(에러를 던지지 않는다)
- [ ] Given 두 환경변수가 올바르게 설정된 상태, When 앱을 부팅하고 `getSupabaseCredentials()`를 호출하면, Then 정상적으로 부팅되고 설정된 URL/anonKey를 그대로 반환한다
- [ ] Given Route Handler에서 Supabase 서버 클라이언트를 호출하는 상황, When Supabase가 `user_already_exists` 에러를 반환하면, Then `mapSupabaseAuthError`가 이를 `ApiErrorCode.CONFLICT`로 변환한다
- [ ] Given Supabase가 매핑 테이블에 없는 에러 코드를 반환하는 상황, When `mapSupabaseAuthError`가 처리하면, Then 원본 에러를 노출하지 않고 `ApiErrorCode.INTERNAL_ERROR`(상태 500)로 흡수한다

## Definition of Done 체크

- [ ] `.env.example` 업데이트
- [ ] Secret 하드코딩 없음
- [ ] Service Role Key 미사용 확인
