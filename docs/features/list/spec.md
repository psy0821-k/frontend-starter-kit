# Templates 메뉴 기능 명세 및 TDD 설계

**작성일**: 2026-08-11
**상태**: 유닛/통합/E2E(권한 가드) 테스트 작성 완료 — 실제 CRUD 플로우 E2E는 Supabase 연결 후 추가 예정
**목표**: 템플릿 생성(Create) / 수정(Update) / 삭제(Delete) 기능의 TDD 기반 구현 설계

이 문서는 요약 인덱스입니다. 상세 내용은 아래 문서를 참고하세요.

- [design.md](./design.md) — 기능 요구사항(생성/수정/삭제 API·UI 명세), TDD 테스트 레이어별 설계, 참고 사항
- [progress.md](./progress.md) — 작업 이력, 작성된 테스트 목록과 결과, 남은 작업

---

## 요약

`/templates` 메뉴는 재사용 가능한 페이지 단위의 템플릿을 관리하는 공간입니다.
목록(`/templates`)·상세(`/templates/[id]`) 조회는 기존에 구현되어 있었고,
이번 작업 범위는 **관리자 전용 생성(`/templates/new`)/수정(`/templates/[id]/edit`)/삭제** 기능의
TDD 검증입니다.

확인 결과 기능 구현 자체(스키마, API 클라이언트, Route Handler, 폼/다이얼로그 UI)는
이미 완료되어 있었고, 테스트가 없는 상태였습니다. 이번 작업에서 유닛·통합·E2E(권한 가드) 테스트를
신규 작성해 전수 통과를 확인했습니다. 자세한 테스트 목록과 결과는 [progress.md](./progress.md)를,
요구사항·설계 상세는 [design.md](./design.md)를 참고하세요.

**핵심 결과**:

- `npm run test` 96개 전체 통과, `npm run lint` / `npm run type-check` 통과
- `npx playwright test src/app/templates` 16개 전체 통과(권한 가드 검증 포함)
- 실제 로그인 기반 생성→수정→삭제 전체 플로우 E2E는 이 환경에 Supabase 미설정으로 보류 (진행 방법: [progress.md](./progress.md) "남은 작업" 참고)
