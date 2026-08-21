-- ============================================================
-- 010. features 기본 스키마 — features / feature_files
-- ============================================================
-- 이 파일은 원격 Supabase 프로젝트에 이미 적용되어 있던 마이그레이션을
-- 실제 DB 스키마(pg_policies, information_schema, pg_constraint 등)를
-- 조회해 역산 재구성한 것이다(로컬 저장소에 원본 파일이 누락되어 있었음,
-- docs/features/feature-catalog-db/spec-fixed.md 참고). 001_initial_schema.sql의
-- templates/template_files와 동일한 패턴을 따른다.
-- ============================================================

create table if not exists public.features (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (char_length(title) between 1 and 100),
  summary     text not null check (char_length(summary) <= 200),
  category    text not null check (category in ('search', 'board', 'comment', 'payment', 'notification')),
  tags        text[] not null default '{}',
  tech_stack  text[] not null default '{}',
  description text not null,
  author_id   uuid not null references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint features_updated_after_created check (updated_at >= created_at)
);

create index if not exists features_category_updated_at_idx
  on public.features (category, updated_at desc);

create table if not exists public.feature_files (
  id          uuid primary key default gen_random_uuid(),
  feature_id  uuid not null references public.features (id) on delete cascade,
  file_path   text not null check (char_length(file_path) between 1 and 255),
  code        text not null check (char_length(code) <= 100000),
  language    text not null default 'plaintext',
  sort_order  int not null default 0,
  unique (feature_id, file_path)
);

create index if not exists feature_files_feature_id_sort_order_idx
  on public.feature_files (feature_id, sort_order);

drop trigger if exists features_set_updated_at on public.features;
create trigger features_set_updated_at
  before update on public.features
  for each row execute function public.set_updated_at();

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

drop trigger if exists features_freeze_immutables on public.features;
create trigger features_freeze_immutables
  before update on public.features
  for each row execute function public.freeze_feature_immutables();

alter table public.features      enable row level security;
alter table public.feature_files enable row level security;

drop policy if exists "누구나 Feature 조회" on public.features;
create policy "누구나 Feature 조회" on public.features
  for select using (true);

drop policy if exists "관리자만 Feature 등록" on public.features;
create policy "관리자만 Feature 등록" on public.features
  for insert with check (author_id = auth.uid() and public.is_admin());

drop policy if exists "관리자만 Feature 수정" on public.features;
create policy "관리자만 Feature 수정" on public.features
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "관리자만 Feature 삭제" on public.features;
create policy "관리자만 Feature 삭제" on public.features
  for delete using (public.is_admin());

drop policy if exists "누구나 Feature 파일 조회" on public.feature_files;
create policy "누구나 Feature 파일 조회" on public.feature_files
  for select using (true);

drop policy if exists "관리자만 Feature 파일 쓰기" on public.feature_files;
create policy "관리자만 Feature 파일 쓰기" on public.feature_files
  for all using (public.is_admin()) with check (public.is_admin());

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
    title, summary, category, tags, tech_stack, description, author_id
  )
  values (
    payload ->> 'title',
    payload ->> 'summary',
    payload ->> 'category',
    coalesce(array(select jsonb_array_elements_text(payload -> 'tags')), '{}'),
    coalesce(array(select jsonb_array_elements_text(payload -> 'tech_stack')), '{}'),
    payload ->> 'description',
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
    description = payload ->> 'description'
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
