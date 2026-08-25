# Feature 상세 페이지 — 초기 아이디어

**작성일**: 2026-08-24

## 배경

`docs/features/feature-catalog-db/spec-fixed.md` §7에서 "상세 페이지(`/features/[id]`)는
이번 범위 제외 — 목록 조회만 DB로 전환한다"고 명시적으로 결정했었다. 같은 문서 §7 마지막에
"summary/tags/tech_stack/usage 등 목록 카드에 쓰지 않는 컬럼의 조회 — 상세 페이지가 생길 때
함께 다룬다"고 남겨둔 상태다.

사용자가 `/features` 목록에서 카드를 클릭해도 상세 페이지로 이동하지 않는 것을 발견했고,
이번에 그 Out of Scope였던 상세 페이지를 실제로 구현하기로 했다.

## 하고 싶은 것 (초기 아이디어)

- `/features` 목록의 각 `FeatureCard`를 클릭하면 `/features/[id]` 상세 페이지로 이동한다.
- 상세 페이지는 목록에서 보여주지 않던 컬럼(`summary`, `tags`, `tech_stack`, `usage`)을 함께
  보여준다.
- `feature_files` 테이블(`templates`의 `template_files`와 대칭 구조: `file_path`, `code`,
  `language`, `sort_order`)이 이미 DB에 존재한다 — 상세 페이지에서 코드까지 보여줄지는 결정
  필요.

## 참고할 기존 구현

- `src/app/templates/[id]/page.tsx` — 대칭 도메인인 템플릿 상세 페이지. 가장 가까운 참고 대상.
- `src/features/starter-kit/api/get-starter-kit-by-id.ts` — 단건 조회 + 파일 임베딩 패턴.
- `src/features/feature-catalog/` — 현재 목록 구현(`get-features.ts`, `model/types.ts`,
  `feature-card.tsx` 등).
- `supabase/migrations/010_features_schema.sql`, `013_features_add_usage.sql` — `features`/
  `feature_files` 테이블 스키마.

## 모호한 점 (인터뷰에서 확정 필요)

- 코드 뷰어(`StarterKitCodeViewer`)를 features 상세에도 그대로 적용할지, 아니면 이번 범위는
  텍스트 정보(`summary`/`tags`/`tech_stack`/`usage`)만 보여줄지.
- 북마크(`BookmarkButton`)를 features 상세에도 붙일지 — `bookmarks` 테이블은 이미
  `target_type: 'feature'`를 지원하고 있고, 마이페이지 북마크 목록(이슈 #31)도 feature
  북마크를 이미 다루고 있음.
- 관리자 수정/삭제 UI 포함 여부(템플릿 상세에는 있음, features는 아직 등록 UI 자체가 없음).
- 존재하지 않는 id 접근 시 404 처리 방식(템플릿과 동일하게 `notFound()` 사용할지).
