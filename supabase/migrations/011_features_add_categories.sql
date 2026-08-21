-- ============================================================
-- 011. features 카테고리 확장 — form / ui / performance 추가
-- ============================================================
-- 010에서 routing.md 예시(search/board/comment/payment/notification)만
-- 반영했던 category check 제약을 실제 등록된 Feature 유형에 맞게 확장한다.
-- (역산 재구성: 004_update_template_categories.sql과 동일한 패턴 —
-- check 제약은 컬럼 정의 일부라 drop 후 재생성한다.)
-- ============================================================

alter table public.features drop constraint if exists features_category_check;

alter table public.features add constraint features_category_check
  check (category in (
    'search', 'board', 'comment', 'payment', 'notification',
    'form', 'ui', 'performance'
  ));
