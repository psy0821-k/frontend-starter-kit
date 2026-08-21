-- ============================================================
-- 010. bookmarks — 템플릿/Feature 공용 북마크
-- ============================================================
-- docs/features/bookmark/spec-fixed.md §3.1 설계를 그대로 따른다.
-- templates(DB 테이블)와 features(정적 하드코딩, DB 테이블 없음) 양쪽을
-- target_type 컬럼으로 구분해 하나의 테이블로 관리한다. features의
-- target_id는 FK 없이 정적 slug 문자열을 값으로만 저장한다(§3.1 참고,
-- polymorphic association이라 두 타입을 한 컬럼에 섞으면 FK를 걸 수 없다).
-- ============================================================

create table if not exists public.bookmarks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  target_type text not null check (target_type in ('template', 'feature')),
  target_id   text not null,
  created_at  timestamptz not null default now(),
  -- 같은 사용자가 같은 target을 두 번 북마크하는 것은 UI에서 발생하지 않아야
  -- 하지만, 더블클릭 등 클라이언트 레이스를 서버가 최종적으로 막는 안전장치다.
  -- Route Handler는 이 제약 위반(23505)을 에러로 취급하지 않고 idempotent하게
  -- 현재 상태를 반환한다(spec-fixed.md 시나리오 5).
  unique (user_id, target_type, target_id)
);

-- 카운트 조회(select count(*) where target_type = ? and target_id = ?)가
-- 목록/상세 페이지에서 매번 호출되므로 인덱스가 필요하다.
create index if not exists bookmarks_target_idx
  on public.bookmarks (target_type, target_id);

alter table public.bookmarks enable row level security;

-- 카운트는 공개 정보(spec-fixed.md §5-1-1: 비로그인도 GET 허용, isBookmarked만 false)라
-- SELECT는 전체 공개한다. 어떤 target이 북마크됐는지는 노출되지만 "누가"
-- 북마크했는지는 이 정책만으로는 알 수 없다(user_id 컬럼 값 자체는 응답에
-- 포함하지 않는 것은 애플리케이션 레이어의 책임).
drop policy if exists "누구나 북마크 조회" on public.bookmarks;
create policy "누구나 북마크 조회" on public.bookmarks
  for select using (true);

drop policy if exists "본인 북마크만 생성" on public.bookmarks;
create policy "본인 북마크만 생성" on public.bookmarks
  for insert with check (auth.uid() = user_id);

drop policy if exists "본인 북마크만 삭제" on public.bookmarks;
create policy "본인 북마크만 삭제" on public.bookmarks
  for delete using (auth.uid() = user_id);
