-- ============================================================
-- 007. 템플릿 라이브 프리뷰 URL 컬럼 제거 (v1 롤백)
-- ============================================================
-- 006에서 추가한 preview_url(iframe embed 방식)을 Sandpack 기반 즉석
-- 렌더링(v2, is_entry 필드)으로 완전히 대체하며 제거한다.
-- 결정 배경: docs/templates/feature/detail/prd.md(v2) Out of Scope 참조.
--
-- 로컬 마이그레이션 파일이 누락되어 있던 것을 원격 이력 기준으로 사후
-- 복원한 것이다. 원격 타임스탬프 순서상 이 롤백이
-- 007_template_file_is_entry.sql(is_entry 컬럼 추가)보다 먼저 적용됐다.
-- ============================================================

alter table public.templates drop column if exists preview_url;
