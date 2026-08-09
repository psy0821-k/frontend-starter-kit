-- ============================================================
-- 001. 초기 스키마 — profiles / templates / template_files
-- ============================================================
-- Supabase SQL Editor에서 이 파일 전체를 실행한다.
-- 이 프로젝트는 Service Role Key를 사용하지 않으므로, 모든 쓰기는
-- anon key + 사용자 세션(쿠키)으로 나간다. 즉 DB 입장에서는
-- Route Handler를 통한 요청과 브라우저 직접 요청을 구분할 수 없다.
-- 따라서 권한과 신뢰값(updated_at 등)은 전부 DB가 강제해야 한다.
-- ============================================================

-- ------------------------------------------------------------
-- profiles
-- ------------------------------------------------------------
-- auth.users를 확장하는 공개 프로필.
-- role은 관리자 판별용이며, 기본값 'user'로 두고 관리자는 수동 승격한다
-- (가입 플로우에서 role을 받지 않는다 — 받으면 누구나 admin으로 가입 가능).
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  nickname   text not null unique,
  name       text not null,
  role       text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- templates
-- ------------------------------------------------------------
-- 재사용 가능한 페이지(UI) 단위 자산.
-- 컬럼명은 src/features/starter-kit/model/types.ts의 StarterKit과 1:1로 맞춘다.
-- features 테이블은 성격이 다른 자산(이미지 없음, category 축 다름)이므로
-- 이 테이블에 합치지 않고 별도로 만든다 — 이번 마이그레이션 범위 밖.
create table if not exists public.templates (
  id             uuid primary key default gen_random_uuid(),
  title          text not null check (char_length(title) between 1 and 100),
  summary        text not null check (char_length(summary) <= 200),
  category       text not null check (category in ('erp', '포트폴리오', '쇼핑몰')),
  tags           text[] not null default '{}',
  thumbnail_url  text not null,
  description    text not null,
  features       text[] not null default '{}',
  tech_stack     text[] not null default '{}',
  preview_images text[] not null default '{}',
  author_id      uuid not null references auth.users (id) on delete cascade,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  -- 등록일이 수정일보다 나중일 수 없다. 상세 페이지의 날짜 표시가
  -- 이 불변식에 의존한다(두 날짜가 같으면 '등록'만 노출).
  constraint templates_updated_after_created check (updated_at >= created_at)
);

create index if not exists templates_category_updated_at_idx
  on public.templates (category, updated_at desc);

-- ------------------------------------------------------------
-- template_files
-- ------------------------------------------------------------
-- 템플릿을 구성하는 파일 단위 코드.
-- file_path는 'src/features/auth/ui/login-form.tsx'처럼 전체 경로를
-- 하나의 컬럼에 담는다. 폴더와 파일명을 나누지 않는 이유는 항상 붙여 쓰고
-- 따로 조회할 일이 없어 조합·검증 코드만 늘어나기 때문이다.
create table if not exists public.template_files (
  id          uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.templates (id) on delete cascade,
  file_path   text not null check (char_length(file_path) between 1 and 255),
  -- 단일 레코드가 응답 페이로드를 폭파시키지 않도록 상한을 둔다.
  code        text not null check (char_length(code) <= 100000),
  language    text not null default 'plaintext',
  sort_order  int not null default 0,
  -- 같은 템플릿 안에 동일 경로가 두 번 나오는 것은 명백한 입력 실수다.
  unique (template_id, file_path)
);

create index if not exists template_files_template_id_sort_order_idx
  on public.template_files (template_id, sort_order);

-- ------------------------------------------------------------
-- updated_at 자동 갱신 트리거
-- ------------------------------------------------------------
-- 애플리케이션이 updated_at을 직접 넣으면 클라이언트가 임의의 값을 보낼 수 있다
-- (위 주석 참조 — anon key 직접 호출을 배제할 수 없음).
-- 화면에 "수정일"로 표시할 신뢰값이므로 DB가 강제한다.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists templates_set_updated_at on public.templates;
create trigger templates_set_updated_at
  before update on public.templates
  for each row execute function public.set_updated_at();

-- created_at과 author_id는 UPDATE로 변경할 수 없게 고정한다.
-- RLS는 행 단위 접근만 제어할 뿐 컬럼 단위 보호를 하지 않으므로,
-- 이 트리거가 없으면 소유자가 자기 레코드의 등록일을 위조할 수 있다.
create or replace function public.freeze_template_immutables()
returns trigger
language plpgsql
as $$
begin
  new.created_at = old.created_at;
  new.author_id  = old.author_id;
  return new;
end;
$$;

drop trigger if exists templates_freeze_immutables on public.templates;
create trigger templates_freeze_immutables
  before update on public.templates
  for each row execute function public.freeze_template_immutables();

-- ------------------------------------------------------------
-- RLS — 읽기는 전체 공개, 쓰기는 관리자만
-- ------------------------------------------------------------
-- NEXT_PUBLIC_SUPABASE_ANON_KEY는 정의상 브라우저에 노출된다.
-- 쓰기를 열어두면 누구나 Route Handler를 우회해 REST 엔드포인트로 직접
-- INSERT할 수 있고, code 컬럼에 100KB씩 밀어넣는 스토리지 고갈이 가능하다.
alter table public.profiles       enable row level security;
alter table public.templates      enable row level security;
alter table public.template_files enable row level security;

-- profiles: 닉네임 중복 확인(check-nickname)이 미인증 상태에서 동작해야 하므로
-- SELECT는 공개한다. 본인 행만 수정 가능하되 role은 아래 트리거로 고정한다.
drop policy if exists "누구나 프로필 조회" on public.profiles;
create policy "누구나 프로필 조회" on public.profiles
  for select using (true);

drop policy if exists "본인 프로필만 생성" on public.profiles;
create policy "본인 프로필만 생성" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "본인 프로필만 수정" on public.profiles;
create policy "본인 프로필만 수정" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- role 자기 승격 차단. 위 UPDATE 정책은 "본인 행"만 보장할 뿐이라
-- 이 트리거가 없으면 일반 사용자가 자신을 admin으로 바꿀 수 있다.
create or replace function public.freeze_profile_role()
returns trigger
language plpgsql
as $$
begin
  new.role = old.role;
  return new;
end;
$$;

drop trigger if exists profiles_freeze_role on public.profiles;
create trigger profiles_freeze_role
  before update on public.profiles
  for each row execute function public.freeze_profile_role();

-- 관리자 판별 헬퍼. 정책마다 exists 서브쿼리를 반복하지 않기 위해 분리한다.
-- profiles의 SELECT가 공개이므로 security definer가 필요 없다.
create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- templates
drop policy if exists "누구나 템플릿 조회" on public.templates;
create policy "누구나 템플릿 조회" on public.templates
  for select using (true);

drop policy if exists "관리자만 템플릿 등록" on public.templates;
create policy "관리자만 템플릿 등록" on public.templates
  for insert with check (author_id = auth.uid() and public.is_admin());

drop policy if exists "관리자만 템플릿 수정" on public.templates;
create policy "관리자만 템플릿 수정" on public.templates
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "관리자만 템플릿 삭제" on public.templates;
create policy "관리자만 템플릿 삭제" on public.templates
  for delete using (public.is_admin());

-- template_files: 부모 템플릿의 권한을 그대로 따른다.
drop policy if exists "누구나 파일 조회" on public.template_files;
create policy "누구나 파일 조회" on public.template_files
  for select using (true);

drop policy if exists "관리자만 파일 쓰기" on public.template_files;
create policy "관리자만 파일 쓰기" on public.template_files
  for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- create_template — 템플릿 + 파일을 한 트랜잭션으로 등록
-- ------------------------------------------------------------
-- supabase-js는 다중 테이블 트랜잭션을 지원하지 않는다. templates INSERT 후
-- template_files INSERT가 실패하면 파일 없는 고아 템플릿이 남으므로,
-- 트랜잭션을 DB 안으로 밀어넣는다(함수 본문 전체가 하나의 트랜잭션).
--
-- security invoker가 필수다. definer로 만들면 함수가 소유자 권한으로 실행되어
-- 위에서 설계한 RLS를 전부 우회한다.
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

  insert into public.template_files (template_id, file_path, code, language, sort_order)
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

-- ------------------------------------------------------------
-- update_template — 전체 교체(PUT 의미론)
-- ------------------------------------------------------------
-- 파일 배열은 부분 수정 의미론이 모호하므로("1개만 보내면 나머지는 유지인가
-- 삭제인가") 전량 삭제 후 재삽입한다. 이 역시 한 트랜잭션 안에서 일어난다.
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

  -- RLS가 행을 숨기면 0 rows가 되어 여기서 null이다.
  -- 호출부는 이를 NOT_FOUND로 매핑한다(403은 리소스 존재 여부를 누설한다).
  if updated_id is null then
    return null;
  end if;

  delete from public.template_files where template_id = target_id;

  insert into public.template_files (template_id, file_path, code, language, sort_order)
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
