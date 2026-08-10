-- ============================================================
-- 008. create_template/update_template에 is_entry 반영
-- ============================================================
-- 007에서 추가한 template_files.is_entry를 등록/수정 RPC가 저장하도록
-- 함수 본문을 갱신한다. jsonb_to_recordset의 레코드 타입에 is_entry 컬럼을
-- 추가하고, coalesce로 누락 시 false로 채운다(과거 클라이언트 호환).
-- ============================================================

create or replace function public.create_template(payload jsonb)
returns uuid
language plpgsql
security invoker
as $$
declare
  new_id uuid;
begin
  insert into public.templates (
    title, summary, category, tags, thumbnail_url,
    description, features, tech_stack, preview_images, author_id
  )
  values (
    payload ->> 'title',
    payload ->> 'summary',
    payload ->> 'category',
    coalesce(array(select jsonb_array_elements_text(payload -> 'tags')), '{}'),
    payload ->> 'thumbnail_url',
    payload ->> 'description',
    coalesce(array(select jsonb_array_elements_text(payload -> 'features')), '{}'),
    coalesce(array(select jsonb_array_elements_text(payload -> 'tech_stack')), '{}'),
    coalesce(array(select jsonb_array_elements_text(payload -> 'preview_images')), '{}'),
    auth.uid()
  )
  returning id into new_id;

  insert into public.template_files (template_id, file_path, code, language, sort_order, is_entry)
  select
    new_id,
    f.file_path,
    f.code,
    coalesce(f.language, 'plaintext'),
    coalesce(f.sort_order, 0),
    coalesce(f.is_entry, false)
  from jsonb_to_recordset(payload -> 'files')
    as f(file_path text, code text, language text, sort_order int, is_entry boolean);

  return new_id;
end;
$$;

create or replace function public.update_template(target_id uuid, payload jsonb)
returns uuid
language plpgsql
security invoker
as $$
declare
  updated_id uuid;
begin
  update public.templates
  set
    title          = payload ->> 'title',
    summary        = payload ->> 'summary',
    category       = payload ->> 'category',
    tags           = coalesce(array(select jsonb_array_elements_text(payload -> 'tags')), '{}'),
    thumbnail_url  = payload ->> 'thumbnail_url',
    description    = payload ->> 'description',
    features       = coalesce(array(select jsonb_array_elements_text(payload -> 'features')), '{}'),
    tech_stack     = coalesce(array(select jsonb_array_elements_text(payload -> 'tech_stack')), '{}'),
    preview_images = coalesce(array(select jsonb_array_elements_text(payload -> 'preview_images')), '{}')
  where id = target_id
  returning id into updated_id;

  if updated_id is null then
    return null;
  end if;

  delete from public.template_files where template_id = target_id;

  insert into public.template_files (template_id, file_path, code, language, sort_order, is_entry)
  select
    target_id,
    f.file_path,
    f.code,
    coalesce(f.language, 'plaintext'),
    coalesce(f.sort_order, 0),
    coalesce(f.is_entry, false)
  from jsonb_to_recordset(payload -> 'files')
    as f(file_path text, code text, language text, sort_order int, is_entry boolean);

  return updated_id;
end;
$$;
