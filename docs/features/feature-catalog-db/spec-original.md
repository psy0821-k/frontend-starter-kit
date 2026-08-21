# features 도메인 DB 연동 — 초기 아이디어

## 배경

`docs/features/bookmark/` 작업 중 발견: 원격 Supabase 프로젝트에는 이미 `public.features`
(uuid PK, 15 rows), `public.feature_files`(15 rows) 테이블이 마이그레이션
(`010_features_schema`, `011_features_add_categories`, `012_features_update_function`,
`013_features_add_usage`)으로 적용되어 있다. 컬럼 구조는 `templates`/`template_files`와
유사(`title`, `summary`, `category`, `tags`, `tech_stack`, `description`, `author_id`,
`usage`, `feature_files`).

하지만 로컬 `src/features/feature-catalog/model/data.ts`는 여전히 `FEATURES` 정적 배열(8개
항목, id가 `'search'` 같은 문자열 slug)을 쓰고 있다. `docs/features/list/`,
`docs/features/search/`의 스펙 문서도 모두 "features는 정적 데이터, DB 테이블 없음"을
전제로 작성되었다.

로컬 `supabase/migrations/`에는 010~013 마이그레이션 파일 자체가 없다(원격에는 적용됐지만
로컬 저장소에 파일로 커밋되지 않은 상태).

## 한 줄 정의

`features` 도메인을 로컬 정적 배열에서 이미 존재하는 원격 DB 테이블(`features`,
`feature_files`) 기반으로 전환한다.
