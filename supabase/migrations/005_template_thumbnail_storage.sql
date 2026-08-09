-- ============================================================
-- 002. 템플릿 썸네일 Storage 버킷 + RLS
-- ============================================================
-- 썸네일 입력을 텍스트 경로/URL에서 실제 파일 업로드로 바꾼다.
-- 결정 배경: docs/features/template-create/prd.md 결정 2 참조.
--
-- 클라이언트(브라우저)가 supabase-js로 이 버킷에 직접 업로드한다.
-- templates 테이블과 동일하게 "anon key + RLS가 최종 방어선" 모델을 따른다
-- (001_initial_schema.sql 상단 주석 참조).
--
-- public 버킷을 쓰는 이유: 템플릿 조회 자체가 "누구나 조회 가능" 정책이므로
-- 썸네일도 서명 URL 없이 공개 URL로 제공하는 편이 일관적이고 단순하다.
-- ============================================================

-- file_size_limit(bytes)·allowed_mime_types는 클라이언트 검증과 별개로
-- Storage가 강제하는 이중 방어선이다(클라이언트 검증은 우회 가능하므로).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'template-thumbnails',
  'template-thumbnails',
  true,
  5242880, -- 5MB
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 조회는 공개(공개 URL로 접근하는 모든 요청 포함).
drop policy if exists "누구나 썸네일 조회" on storage.objects;
create policy "누구나 썸네일 조회" on storage.objects
  for select
  using (bucket_id = 'template-thumbnails');

-- 업로드(INSERT)는 관리자만. is_admin()은 001에서 정의된 헬퍼를 재사용한다.
drop policy if exists "관리자만 썸네일 업로드" on storage.objects;
create policy "관리자만 썸네일 업로드" on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'template-thumbnails' and public.is_admin());

-- 파일 교체(업데이트) 시 upsert가 내부적으로 UPDATE를 수행하므로
-- INSERT만 열어두면 재업로드가 실패한다. SELECT는 위 정책으로 이미 공개다.
drop policy if exists "관리자만 썸네일 교체" on storage.objects;
create policy "관리자만 썸네일 교체" on storage.objects
  for update
  to authenticated
  using (bucket_id = 'template-thumbnails' and public.is_admin())
  with check (bucket_id = 'template-thumbnails' and public.is_admin());

-- 잘못 업로드한 파일을 관리자가 정리할 수 있도록 삭제도 허용한다.
drop policy if exists "관리자만 썸네일 삭제" on storage.objects;
create policy "관리자만 썸네일 삭제" on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'template-thumbnails' and public.is_admin());
