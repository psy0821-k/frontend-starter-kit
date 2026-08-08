# Issue 01 — Supabase 연동 기반 구축

**의존성**: 없음 (최초 이슈)
**관련 PRD**: [prd.md](./prd.md) §기술 결정 "Supabase 연동 구조 — BFF 경유", §Security Impact

## 목표

Supabase 프로젝트와의 연결 기반(환경변수, 서버 클라이언트, 에러 매핑 유틸)을 갖춰, 이후 이슈들이 실제 Supabase 호출을 만들 수 있게 한다. 이 이슈만으로는 화면에 새로운 동작이 보이지 않지만, 이후 이슈의 필수 선행 작업이며 부팅 시점 환경변수 검증이라는 관찰 가능한 결과가 있다.

## 작업 범위

- `src/shared/config/env.ts`에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` Zod 검증 추가
- `.env.example`에 두 키 추가 (실제 값 없이 placeholder)
- `src/shared/api/supabase/server.ts` — Route Handler 전용 Supabase 서버 클라이언트 (Anon Key + 사용자 세션 기반, Service Role 미사용)
- Supabase 에러 → `ApiError`/`ApiErrorCode` 매핑 유틸 (예: `src/shared/api/supabase/map-error.ts`) — `user_already_exists` → `CONFLICT` 등 최소 매핑 테이블

## Acceptance Criteria

- [ ] Given `NEXT_PUBLIC_SUPABASE_URL` 또는 `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 설정되지 않은 상태, When 앱을 부팅하면, Then 부팅 시점에 어떤 환경변수가 누락됐는지 콘솔 에러로 안내하며 실패한다
- [ ] Given 두 환경변수가 올바르게 설정된 상태, When 앱을 부팅하면, Then 정상적으로 부팅된다
- [ ] Given Route Handler에서 Supabase 서버 클라이언트를 호출하는 상황, When Supabase가 `user_already_exists` 에러를 반환하면, Then 매핑 유틸이 이를 `ApiErrorCode.CONFLICT`로 변환한다

## Definition of Done 체크

- [ ] `.env.example` 업데이트
- [ ] Secret 하드코딩 없음
- [ ] Service Role Key 미사용 확인
