-- ============================================================
-- 002. 신규 가입자 프로필 자동 생성 트리거
-- ============================================================
-- auth.users에 새 행이 생기면 public.profiles에 대응 행을 자동 생성한다.
-- SECURITY DEFINER + search_path 고정이 필수다 — 트리거 함수는 호출자(가입
-- 시도자) 권한이 아니라 정의자 권한으로 실행되어야 profiles insert가
-- 성공하고(RLS가 일반 사용자의 임의 insert는 막으므로), search_path를
-- 고정하지 않으면 동일 이름의 다른 스키마 오브젝트가 먼저 매칭될 위험이 있다.
--
-- 참고: 아래 정의는 로컬 마이그레이션 파일이 누락되어 있던 것을 원격 프로젝트의
-- 실제 적용 상태(pg_get_functiondef)를 기준으로 사후 복원한 것이다.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  insert into public.profiles (id, nickname, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nickname', new.id::text),
    coalesce(new.raw_user_meta_data ->> 'name', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
