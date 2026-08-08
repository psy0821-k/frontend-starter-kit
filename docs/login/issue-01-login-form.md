# Issue 01 — 로그인 폼 UI 및 통일 에러 메시지

**의존성**: 없음 (기존 `auth` 인프라 — Supabase 서버 클라이언트, `mapSupabaseAuthError`, `useAppForm` — 재사용)
**관련 PRD**: [prd.md](./prd.md) §기술 결정 "로그인 실패 통일 메시지 — BFF 계층에서 메시지를 하나로 고정"

## 목표

`/auth/login` 페이지에서 이메일·비밀번호를 입력해 로그인을 시도할 수 있다. 이메일이 틀렸든 비밀번호가 틀렸든 구분 없이 하나의 통일된 에러 메시지로 안내한다. 이 이슈로 로그인 화면과 실패 피드백까지 완결되지만, 실제 세션 발급(자동 로그인 유지)의 실동작 검증은 이번 스코프가 아니다 — 회원가입 때와 동일하게 제출 로직은 완성해두되 실제 네트워크 호출은 `e.preventDefault()`로 막는다.

## 작업 범위

- `src/features/auth/model/schema.ts` — `loginSchema`(이메일 형식, 비밀번호 최소 1자 이상 — 실제 자격 증명 확인은 서버) 추가
- `src/app/auth/login/page.tsx` — 서버 컴포넌트 셸
- `src/features/auth/ui/login-form.tsx` — 클라이언트, `useAppForm(loginSchema)`(mode 생략, onBlur 기본값), `ApiErrorCode === 'INVALID_CREDENTIALS'` 시 통일 메시지 표시
- `src/app/api/auth/login/route.ts` — Supabase 서버 SDK로 로그인 처리, 기존 `mapSupabaseAuthError` 재사용
- 로그인 폼에 "비밀번호를 잊으셨나요?"(`/auth/forgot-password` 링크, 미구현 페이지로 연결됨) + "회원가입"(`/auth/register` 링크) 배치

## Acceptance Criteria

- [ ] Given `/auth/login` 페이지, When 방문하면, Then 이메일/비밀번호 입력 필드와 로그인 버튼, "비밀번호를 잊으셨나요?"·"회원가입" 링크가 보인다
- [ ] Given 이메일 필드, When 형식에 맞지 않는 값을 입력하고 필드를 벗어나면(blur), Then 에러가 표시된다(onBlur 검증 — 회원가입과 달리 onChange 아님)
- [ ] Given 로그인 실패 응답(`INVALID_CREDENTIALS`), When 응답을 받으면, Then "이메일 또는 비밀번호가 올바르지 않습니다" 형태의 통일 메시지가 표시되고, 이메일 미가입인지 비밀번호 오류인지는 화면 어디에도 구분되어 나타나지 않는다
- [ ] Given 로그인 버튼을 클릭, When 클릭 시점, Then 실제 네트워크 요청은 발생하지 않는다(`e.preventDefault()` 가드 — Supabase 미연결 상태)

## Definition of Done 체크

- [ ] Supabase 원본 에러가 `ApiError`/`ApiErrorCode`로 매핑되어 프론트엔드에 노출되지 않음
- [ ] 로그에 비밀번호 등 민감정보 출력 없음
- [ ] 이메일 미가입과 비밀번호 오류가 코드 레벨에서도 우연히 구분되지 않는지 확인(별도 분기 없음)
