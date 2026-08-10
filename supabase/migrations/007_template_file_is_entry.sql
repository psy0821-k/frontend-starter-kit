-- ============================================================
-- 007. 템플릿 파일 엔트리 지정(is_entry) 컬럼 추가
-- ============================================================
-- 라이브 미리보기(Sandpack)가 렌더링을 시작할 파일을 관리자가 지정하기 위한
-- 컬럼이다. 결정 배경: docs/templates/feature/detail/spec-fixed.md(v2) 참조.
--
-- 템플릿당 엔트리 파일은 최대 1개로 제한한다 — 부분 유니크 인덱스로
-- (template_id, is_entry=true) 조합의 중복을 DB 레벨에서 막는다.
-- ============================================================

alter table public.template_files
  add column if not exists is_entry boolean not null default false;

create unique index if not exists template_files_one_entry_per_template
  on public.template_files (template_id)
  where is_entry;
