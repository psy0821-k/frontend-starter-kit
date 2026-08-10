-- ============================================================
-- 009. 보안 advisor WARN 일괄 수정
-- ============================================================
-- get_advisors(security) 재검토(2026-08-10) 결과 확인된 두 종류의 WARN을
-- 해소한다.
--
-- 1) function_search_path_mutable: search_path가 고정되지 않은 함수는
--    호출 시점의 세션 search_path에 따라 동일 이름의 다른 오브젝트가
--    먼저 매칭될 수 있다. 6개 함수 모두 정의를 그대로 유지한 채
--    `set search_path = public, pg_temp`만 추가한다(로직 변경 없음).
--
-- 2) handle_new_user()가 anon/authenticated에 여전히 EXECUTE 가능한 상태로
--    남아있었다. 원인은 PostgreSQL이 함수 생성 시 기본적으로 PUBLIC
--    role에게 EXECUTE를 부여하기 때문이다 — 003이 anon/authenticated에서
--    개별 REVOKE했지만, 두 role 모두 PUBLIC을 상속하므로 PUBLIC 자체의
--    권한을 회수하지 않으면 상속을 통해 여전히 실행 가능했다.
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.freeze_template_immutables()
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

create or replace function public.freeze_profile_role()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.role = old.role;
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace function public.create_template(payload jsonb)
returns uuid
language plpgsql
security invoker
set search_path = public, pg_temp
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
set search_path = public, pg_temp
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

-- anon, authenticated에서 개별 REVOKE만으로는 PUBLIC 상속 경로가 남는다.
-- PUBLIC 자체의 EXECUTE 권한을 회수해야 완전히 차단된다.
revoke execute on function public.handle_new_user() from anon, authenticated, public;
