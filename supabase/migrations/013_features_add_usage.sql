-- ============================================================
-- 013. features usage 컬럼 추가
-- ============================================================
-- Feature 상세 페이지에 "사용 방법" 설명을 추가로 노출하기 위한 컬럼.
-- description(소개)과 별개로, 실제 프로젝트에 이 Feature를 통합하는 방법을
-- 설명하는 텍스트다. 기존 15건에는 값이 채워져 있으므로 NULL을 허용한다
-- (신규 등록 시 선택 입력).
-- ============================================================

alter table public.features add column if not exists usage text;

create or replace function public.create_feature(payload jsonb)
returns uuid
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  new_id uuid;
begin
  insert into public.features (
    title, summary, category, tags, tech_stack, description, usage, author_id
  )
  values (
    payload ->> 'title',
    payload ->> 'summary',
    payload ->> 'category',
    coalesce(array(select jsonb_array_elements_text(payload -> 'tags')), '{}'),
    coalesce(array(select jsonb_array_elements_text(payload -> 'tech_stack')), '{}'),
    payload ->> 'description',
    payload ->> 'usage',
    auth.uid()
  )
  returning id into new_id;

  insert into public.feature_files (feature_id, file_path, code, language, sort_order)
  select
    new_id,
    f.file_path,
    f.code,
    coalesce(f.language, 'plaintext'),
    coalesce(f.sort_order, 0)
  from jsonb_to_recordset(payload -> 'files')
    as f(file_path text, code text, language text, sort_order int);

  return new_id;
end;
$$;

create or replace function public.update_feature(target_id uuid, payload jsonb)
returns uuid
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  updated_id uuid;
begin
  update public.features
  set
    title       = payload ->> 'title',
    summary     = payload ->> 'summary',
    category    = payload ->> 'category',
    tags        = coalesce(array(select jsonb_array_elements_text(payload -> 'tags')), '{}'),
    tech_stack  = coalesce(array(select jsonb_array_elements_text(payload -> 'tech_stack')), '{}'),
    description = payload ->> 'description',
    usage       = payload ->> 'usage'
  where id = target_id
  returning id into updated_id;

  if updated_id is null then
    return null;
  end if;

  delete from public.feature_files where feature_id = target_id;

  insert into public.feature_files (feature_id, file_path, code, language, sort_order)
  select
    target_id,
    f.file_path,
    f.code,
    coalesce(f.language, 'plaintext'),
    coalesce(f.sort_order, 0)
  from jsonb_to_recordset(payload -> 'files')
    as f(file_path text, code text, language text, sort_order int);

  return updated_id;
end;
$$;
