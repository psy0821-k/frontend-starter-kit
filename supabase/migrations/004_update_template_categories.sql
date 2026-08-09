-- ============================================================
-- 004. 템플릿 카테고리 CHECK 제약 갱신 (원격 이력 정합용)
-- ============================================================
-- 001_initial_schema.sql의 category CHECK 값 자체를 이미 새 값으로 고쳐뒀지만,
-- 이 프로젝트의 원격 DB에는 001이 구값(Frontend 등)으로 먼저 적용된 이력이
-- 있어 이를 새 값으로 옮기는 마이그레이션이 별도로 필요했다.
-- 001을 그대로 재실행할 신규 환경에서는 이 파일이 사실상 no-op이다.
-- ============================================================

alter table public.templates drop constraint if exists templates_category_check;
alter table public.templates
  add constraint templates_category_check check (category in ('erp', '포트폴리오', '쇼핑몰'));
