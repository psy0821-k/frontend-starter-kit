# Issue 03 — 닉네임 실시간 중복 확인

**의존성**: Issue 01(Supabase 서버 클라이언트), Issue 02(회원가입 폼)
**관련 PRD**: [prd.md](./prd.md) §기술 결정 "닉네임 중복 확인 — 디바운스 후 BFF 호출"

## 목표

닉네임 입력 필드에서 사용자가 입력을 멈추면 자동으로 중복 여부를 조회해 필드 하단에 결과를 보여준다. 사용자가 실제로 관찰 가능한 완결된 동작(입력 → 로딩 → 사용 가능/중복 표시)이다.

## 작업 범위

- `src/app/api/auth/check-nickname/route.ts` — Supabase 서버 클라이언트로 닉네임 조회 후 `{ available: boolean }` 반환
- `src/features/auth/lib/use-nickname-availability.ts` — `useDebouncedValue`(기존 `src/shared/lib/hooks/use-debounced-value.ts` 재사용, 500ms) 거친 값으로 BFF 조회
- `register-form.tsx`/`password-requirement-list.tsx`와 동일한 패턴으로 닉네임 필드 하단에 로딩/사용가능/중복 상태 표시 컴포넌트 연결

## Acceptance Criteria

- [ ] Given 닉네임 입력 필드, When 값을 입력하고 500ms 이상 멈추면, Then 로딩 상태가 표시된 뒤 사용 가능/중복 여부가 표시된다
- [ ] Given 닉네임 입력 필드, When 500ms 이내에 연속으로 값을 바꾸면, Then 마지막 입력값에 대해서만 조회가 실행된다 (중간 입력값에 대한 조회 없음)
- [ ] Given 이미 사용 중인 닉네임, When 조회 결과가 반환되면, Then "이미 사용 중인 닉네임입니다" 형태의 안내가 표시된다
- [ ] Given 사용 가능한 닉네임, When 조회 결과가 반환되면, Then 사용 가능하다는 안내가 표시된다

## Definition of Done 체크

- [ ] Supabase 조회 에러가 `ApiError`로 매핑되어 원본 에러가 프론트엔드에 노출되지 않음
