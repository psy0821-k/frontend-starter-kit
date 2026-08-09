# 템플릿 삭제 기능 PRD

## 개요

관리자가 상세 페이지에서 등록된 템플릿을 삭제하는 기능을 구현한다. 백엔드(`DELETE /api/templates/[id]`)는 이미 구현되어 있으므로, 이번 PRD는 (1) 확인 다이얼로그를 포함한 프런트엔드 UI, (2) 삭제 시 썸네일 Storage 객체를 함께 정리하는 백엔드 확장에 집중한다.

## 사용자 스토리

- 관리자로서, 템플릿을 삭제하기 전에 확인 절차를 거치고 싶다. 되돌릴 수 없는 작업이라 실수로 삭제하는 것을 막기 위함이다.
- 관리자로서, 템플릿을 삭제하면 업로드했던 썸네일 이미지도 함께 정리되길 원한다. 삭제 후에도 Storage에 불필요한 파일이 쌓이는 것을 원치 않기 때문이다.

## 기술 결정

### 결정 1 — 확인 다이얼로그는 shadcn AlertDialog 원본을 신규 추가해 사용

**Context** — 삭제는 파괴적 액션이라 확인 절차가 필요하다. 프로젝트에는 일반 `Dialog` 원본(`src/components/ui/dialog.tsx`)만 있고, 파괴적 액션 전용 접근성 시맨틱(`role="alertdialog"`)을 가진 `AlertDialog` 원본은 없다.

**Decision** — shadcn/ui 패턴을 따라 `src/components/ui/alert-dialog.tsx`를 `Dialog`와 동일한 방식(Base UI 기반)으로 신규 추가한다. 이 원본을 감싸는 `DeleteTemplateDialog`는 "삭제"라는 특정 액션에 특화된 로직(삭제 API 호출, 에러 메시지 표시, 진행 상태 라벨)을 가지므로 아직 다른 도메인에서 재사용된 적 없는 상태에서 `shared/ui`로 올리지 않고 `src/features/starter-kit/ui/`에 둔다("2회 규칙" — 실제로 2번째 사용처가 생기면 그때 공통 부분을 추출해 승격한다).

**Alternatives**

- `window.confirm()` 사용: 구현이 가장 빠르지만 프로젝트 전체가 shadcn 기반 디자인 시스템을 쓰는데 이 지점만 브라우저 네이티브 UI로 이탈해 일관성이 깨지고, 스타일링·에러 메시지 표시가 불가능해 기각.
- 커스텀 모달을 처음부터 새로 작성: 이미 Base UI 기반 `Dialog` 원본이 있어 포커스 트랩·오버레이 등을 처음부터 다시 만드는 것은 명백한 중복이라 기각.

**Consequences**

- 장점: 파괴적 액션에 맞는 접근성 시맨틱을 보장받는다. 향후 다른 삭제 액션(예: 파일 삭제 확인)에도 재사용할 수 있는 원본이 커널에 추가된다.
- 단점: `components/ui`에 원본 파일이 하나 늘어나며, "코드 소유 방식(원본 직접 수정 금지)" 원칙에 따라 이후 스타일 변경 시에도 `shared/ui` 래퍼가 아니라 이 원본을 건드리지 않도록 주의해야 한다.

### 결정 2 — 썸네일 Storage 삭제는 URL 파싱으로 경로를 역산

**Context** — 템플릿 삭제 시 Storage에 업로드된 썸네일 파일도 함께 정리해야 한다. 현재 `thumbnail_url`은 Storage 공개 URL 문자열로만 저장되어 있고, `storage.remove()` 호출에 필요한 버킷 내부 경로(파일명)는 별도로 저장되어 있지 않다.

**Decision** — DELETE Route Handler가 대상 템플릿을 조회할 때 `thumbnail_url`도 함께 가져온 뒤, `/object/public/template-thumbnails/` 이후 부분을 파싱해 Storage 경로를 얻는다. 이 경로로 `storage.from('template-thumbnails').remove([path])`를 호출한 다음(성공 여부와 무관하게) `templates` 행을 삭제한다.

**Alternatives**

- `templates` 테이블에 `thumbnail_path` 컬럼을 별도로 추가: 파싱이 필요 없어 더 견고하지만, 이미 확정되어 구현·배포된 create/edit 플로우의 스키마와 API를 다시 건드려야 한다. "2회 규칙"(같은 요구가 2번째 사용처에서 재현될 때만 구조를 바꾼다) 관점에서 아직 1번째 필요 사례이므로 과설계로 판단해 기각.

**Consequences**

- 장점: 마이그레이션이나 기존 API 변경 없이 삭제 기능 하나로 범위가 닫힌다. URL 파싱 로직은 순수 함수로 분리해 단위 테스트하기 쉽다.
- 단점: Storage 공개 URL 구조(`/object/public/<bucket>/<path>`)가 Supabase 쪽에서 바뀌면 파싱 로직도 함께 깨진다. 이미 `getPublicUrl`을 통해 이 구조에 암묵적으로 의존하고 있으므로(`upload-thumbnail.ts`) 새로운 의존이 추가되는 것은 아니다.

## Out of Scope

- 목록 페이지 카드에서 바로 삭제하는 액션 — 상세 페이지 진입 후 삭제로 한정한다.
- 삭제된 템플릿 복구(휴지통, soft delete).
- Storage 고아 파일 일괄 정리(배치 작업) — Storage 삭제 실패 시 남는 파일은 이번 PRD에서 다루지 않는다.
- 다중 선택 후 일괄 삭제.

## 용어 정의

[create/prd.md](../create/prd.md), [delete/spec-fixed.md](./spec-fixed.md)의 용어 정의를 그대로 따른다. 추가되는 용어는 없다.
