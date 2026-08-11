# Templates 생성/수정/삭제 — 진행 상황

**상위 문서**: [spec.md](./spec.md) · 상세 설계: [design.md](./design.md)

---

## 2026-08-11: 유닛/통합 테스트 작성

명세 작성 후 확인 결과, `create/update/delete` 기능 자체(스키마, API 클라이언트, Route Handler,
`TemplateForm`/`TemplateRegisterForm`/`TemplateEditForm`/`DeleteTemplateDialog`)는 **이미 구현되어
있었으나 테스트가 없는 상태**였습니다. 아래 테스트를 신규 작성하고 전수 통과를 확인했습니다.

| 파일                                   | 테스트 수 | 대상                                                   |
| -------------------------------------- | --------- | ------------------------------------------------------ |
| `model/schema.test.ts`                 | 18        | `templateFormSchema`, `createTemplateSchema` 검증 규칙 |
| `app/api/templates/route.test.ts`      | 5         | `POST` — 권한/검증/성공/충돌/업스트림 에러             |
| `app/api/templates/[id]/route.test.ts` | 12        | `PUT`/`DELETE` — 권한/검증/성공/404/충돌/Storage 정리  |
| `ui/delete-template-dialog.test.tsx`   | 6         | 다이얼로그 열기/삭제/로딩/에러/취소                    |
| `ui/template-register-form.test.tsx`   | 1         | 제출 → `createTemplate` 호출 → 상세 이동               |
| `ui/template-edit-form.test.tsx`       | 1         | 제출 → `updateTemplate` 호출 → 상세 이동               |

**결과**: `npm run test`(96개 전체) · `npm run lint` · `npm run type-check` 모두 통과.

**의도적으로 생략한 항목**:

- `TemplateForm` 자체의 필드 단위 통합 테스트(파일 추가/삭제, 엔트리 체크 등) — `TemplateFileFieldArray`는
  이미 세밀한 책임 분리가 되어 있고, register/edit 래퍼 테스트에서 `TemplateForm`을 모킹해 onSubmit 배선만
  검증했습니다. 폼 필드 전체를 채우는 통합 테스트는 무겁고 깨지기 쉬워 필요 시 별도 요청으로 진행합니다.

---

## 2026-08-11: E2E 테스트 작성

**전제 조건**: 이 환경에는 `.env.local`이 없어 Supabase가 미설정 상태입니다.
`requireAdmin()`은 `isSupabaseConfigured()`가 false면 무조건 예외를 던지므로,
**모든 사용자가 비관리자로 취급되어 관리자 페이지는 항상 404**를 반환합니다.
이 때문에 실제 로그인 계정으로 생성→상세 확인→수정→삭제 전체 플로우를 검증하는
E2E는 이번에는 작성하지 않았고(설계는 [design.md](./design.md) §3.5 참고), **권한 가드 동작만
검증하는 E2E**를 작성했습니다. Supabase 연결 후 관리자 계정으로 전체 플로우
E2E를 추가하는 것을 권장합니다.

| 파일                                                                | 테스트 | 검증 내용                                          |
| ------------------------------------------------------------------- | ------ | -------------------------------------------------- |
| `src/app/templates/new/templates-new.e2e.ts`                        | 2      | 비로그인 접근 시 404, 폼 미노출                    |
| `src/app/templates/[id]/edit/templates-edit.e2e.ts`                 | 3      | 비로그인 접근 시 404(유효/무효 id 모두), 폼 미노출 |
| `src/app/templates/[id]/templates-detail.e2e.ts` (기존 파일에 추가) | 1      | 비로그인 사용자에게 수정 링크·삭제 버튼 미노출     |

**결과**: `npx playwright test src/app/templates` — 16개 전체 통과(기존 10개 + 신규 6개).

---

## 남은 작업

- [ ] Supabase 프로젝트 연결(`.env.local`) 및 관리자 계정 준비
- [ ] 관리자 계정 기반 생성→상세 확인→수정→삭제 전체 플로우 E2E 추가
- [ ] `TemplateForm` 필드 단위 통합 테스트(선택, 필요 시)
