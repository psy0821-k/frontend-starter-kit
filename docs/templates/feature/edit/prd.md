# 템플릿 수정 기능 PRD

## 개요

관리자가 등록된 템플릿을 수정하는 화면(`/templates/[id]/edit`)을 구현한다. 백엔드(`PUT /api/templates/[id]`)는 이미 구현되어 있으므로, 이번 PRD는 프런트엔드(수정 페이지, 폼 재사용 구조)에 집중한다.

## 사용자 스토리

- 관리자로서, 상세 페이지에서 "수정" 버튼을 눌러 기존 값이 채워진 폼으로 이동하고 싶다. 등록 폼을 처음부터 다시 채우는 낭비를 없애기 위함이다.
- 관리자로서, 등록 폼과 동일한 화면·검증 규칙으로 수정하고 싶다. 등록과 수정에서 다른 UI/검증을 겪으면 혼란스럽기 때문이다.

## 기술 결정

### 결정 1 — 등록/수정 폼을 공통 컴포넌트 + 얇은 래퍼로 분리

**Context** — 등록(`TemplateRegisterForm`)과 수정 화면은 필드 구성·검증 규칙이 완전히 동일하고 제출 함수(`createTemplate` vs `updateTemplate`)와 초기값만 다르다. 기존 `TemplateRegisterForm`(250줄 이상)에 분기를 추가할지, 필드 UI를 완전히 분리할지 결정이 필요했다.

**Decision** — 필드 UI를 전담하는 `TemplateForm` 컴포넌트를 `src/features/starter-kit/ui/template-form.tsx`로 분리한다. `TemplateForm`은 `defaultValues`와 `onSubmit(values): Promise<void>` 콜백만 props로 받고 제출 성공/실패 이후의 라우팅·API 호출을 모른다. `TemplateRegisterForm`은 `defaultValues`로 빈 값을, `onSubmit`으로 `createTemplate` 호출 후 상세 페이지 이동을 넘기는 얇은 래퍼가 된다. `TemplateEditForm`을 신설해 `defaultValues`로 기존 템플릿 값을, `onSubmit`으로 `updateTemplate` 호출 후 상세 페이지 이동을 넘긴다.

**Alternatives**

- `TemplateRegisterForm`에 `mode: 'create' | 'edit'` prop 추가: 컴포넌트를 하나만 유지할 수 있지만, 이미 250줄이 넘는 폼에 분기 조건이 여러 지점(제출 함수 선택, 에러 메시지, 기본값)에 흩어져 가독성이 떨어지고 "함수는 하나의 책임만 가진다" 원칙에 어긋난다고 판단해 기각.
- `template-register-form.tsx`를 복사해 `template-edit-form.tsx`를 완전히 별도로 작성: 필드 하나만 바뀌어도 두 파일을 매번 함께 고쳐야 하는 DRY 위반이라 기각.

**Consequences**

- 장점: `src/shared/ui/CLAUDE.md`의 "얇은 래퍼는 정책 주입이 있을 때만 만든다" 원칙과 정확히 부합한다 — 각 래퍼가 주입하는 정책(제출 함수, 초기값, 완료 후 라우팅)이 명확하다. 세 번째 사용처가 생겨도 `TemplateForm`만 재사용하면 된다.
- 단점: 파일이 1개(`template-register-form.tsx`)에서 3개(`template-form.tsx`, `template-register-form.tsx`, `template-edit-form.tsx`)로 늘어나 처음 이 도메인을 보는 사람은 어디를 봐야 할지 한 단계 더 탐색해야 한다. `template-register-form.tsx`의 기존 내부 로직(썸네일 업로드 상태, 파일 필드 배열 연결)을 `TemplateForm`으로 옮기는 리팩터링이 선행되어야 한다.

## Out of Scope

- 템플릿 삭제(delete) UI — 별도 PRD(`docs/templates/feature/delete`) 대상.
- 부분 수정(PATCH) — 백엔드가 전체 교체(PUT)만 지원하며 이번 PRD에서 바꾸지 않는다.
- 동시 편집 충돌 감지(낙관적 잠금) — 마지막 저장이 이전 저장을 덮어쓰는 현재 백엔드 동작을 그대로 따른다.
- 수정 이력(변경 로그) 기록.

## 용어 정의

[create/prd.md](../create/prd.md), [spec-fixed.md](./spec-fixed.md)의 용어 정의를 그대로 따른다. 추가되는 용어:

| 용어               | 정의                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------- |
| `TemplateForm`     | 등록/수정 화면이 공유하는 필드 UI 전담 컴포넌트. `defaultValues`와 `onSubmit` 콜백만 props로 받는다. |
| `TemplateEditForm` | `TemplateForm`에 수정 전용 정책(기존값 프리필, `updateTemplate` 호출)을 주입하는 얇은 래퍼.          |
