-- ============================================================
-- 012. features 함수 보안 강화 — search_path 고정
-- ============================================================
-- 009_fix_security_advisors.sql이 templates 관련 함수에 적용한 것과 동일한
-- 보안 조치를 features 함수(create_feature/update_feature/freeze_feature_immutables)에도
-- 적용한다. 로직 변경 없이 `set search_path = public, pg_temp`만 추가한다.
--
-- 이 저장소로 마이그레이션 히스토리를 역산 재구성하면서(010_features_schema.sql 상단
-- 주석 참고), 010 작성 시점에 이미 search_path 고정을 반영해두었으므로 이 파일은
-- 실행해도 변경이 발생하지 않는 no-op이다(create or replace로 동일 정의 재적용).
-- ============================================================

create or replace function public.freeze_feature_immutables()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.created_at = old.created_at;
  new.author_id  = old.author_id;
  return new;
end;
$$;
