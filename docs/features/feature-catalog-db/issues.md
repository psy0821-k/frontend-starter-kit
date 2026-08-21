# features 도메인 DB 연동 이슈 분해

PRD([prd.md](./prd.md)) 기준. 마이그레이션 복원(코드 변경 아님) + 목록 DB 전환 + bookmark
교차 수정이 서로 분리되면 동작하지 않는 단위이므로 1개 이슈로 진행한다.

---

## 이슈 1 — features 목록을 DB 기반으로 전환 + bookmark 교차 수정

### 설명

원격에 이미 존재하는 `features`/`feature_files` 테이블을 실제 데이터 소스로 삼아 `/features`
목록 페이지를 DB 기반으로 전환한다. 선행 작업으로 로컬에 누락되어 있던 마이그레이션
010~013을 DB 스키마에서 역산 복원해 커밋한다(멱등, 재실행해도 원격에 변경 없음). 정적
`FEATURES` 배열(`data.ts`)을 삭제하므로, 이를 참조하던 bookmark의 `assertTargetExists`도
같은 이슈에서 DB 조회로 함께 수정한다.

이 이슈가 완료되면 사용자가 `/features`에서 실제 DB 데이터(현재 15건)를 보고, Supabase
연결이 끊기거나 데이터가 없을 때도 일관된 빈 상태를 보며, bookmark 기능도 실제 feature id
(uuid)로 정상 동작한다.

### 변경 지점

- `supabase/migrations/010_features_schema.sql` ~ `013_features_add_usage.sql` — 신규 커밋
  (이미 원격에 적용되어 있던 내용을 역산 복원, 멱등)
- `src/features/feature-catalog/model/types.ts` — `Feature.id`를 uuid 기준으로,
  `FEATURE_CATEGORIES`를 8개(search/board/comment/payment/notification/form/ui/performance)로 확장
- `src/features/feature-catalog/api/get-features.ts` — 신규. `get-starter-kits.ts`와 동일한
  시그니처 스타일(`Promise<Feature[]>`), 미설정/에러/실제 0건 모두 `[]` 반환
- `src/app/features/page.tsx` — 정적 `FEATURES` import 제거, `await getFeatures()` 호출로 변경
- `src/features/feature-catalog/ui/feature-empty-state.tsx` — 신규. `StarterKitEmptyState`와
  동일 패턴, "등록된 Feature가 없습니다" 안내
- `src/features/feature-catalog/model/data.ts` — 삭제
- `src/features/feature-catalog/model/test-fixtures.ts` — 기존 테스트가 참조 중이면 유지(단,
  `data.ts` 삭제와 무관한 별도 팩토리이므로 원칙적으로 변경 불필요, 삭제 후 회귀 테스트로 확인)
- `src/app/api/bookmarks/route.ts`의 `assertTargetExists` — `FEATURES.some(...)` 대신
  `features` 테이블을 `select('id').eq('id', targetId).maybeSingle()`로 직접 조회하도록 수정
  (`templates` 존재 검증과 동일한 패턴)

### Acceptance Criteria

- [ ] Given 로컬 저장소를 새로 clone한 뒤 마이그레이션(010~013 포함)을 순서대로 재생했을 때, When 결과 스키마를 확인하면, Then 현재 원격 DB의 `features`/`feature_files` 테이블 구조(컬럼, RLS, 함수)와 동일하다.
- [ ] Given Supabase가 정상 연결된 상태에서, When 사용자가 `/features`에 접속하면, Then 실제 DB에 등록된 Feature 카드가 표시된다(더 이상 정적 배열이 아님).
- [ ] Given Supabase 환경변수가 설정되지 않은 상태에서, When 사용자가 `/features`에 접속하면, Then "등록된 Feature가 없습니다" 빈 상태 UI가 표시된다(mock 데이터가 아님).
- [ ] Given Supabase 조회가 에러를 반환하는 상황에서, When 사용자가 `/features`에 접속하면, Then 위와 동일한 "등록된 Feature가 없습니다" 빈 상태 UI가 표시된다.
- [ ] Given DB에 등록된 Feature가 실제로 0건인 상황에서, When 사용자가 `/features`에 접속하면, Then 위와 동일한 빈 상태 UI가 표시된다.
- [ ] Given 검색어/카테고리 필터를 적용했으나 결과가 0건인 상황에서, When 화면을 보면, Then (전체 데이터는 있으므로) 기존 `FeatureFilteredEmptyState`("조건에 맞는 Feature가 없습니다")가 표시되어 위의 전체 빈 상태와 구분된다.
- [ ] Given 카테고리 필터 UI를 열었을 때, When 옵션 목록을 보면, Then 8개 카테고리(search/board/comment/payment/notification/form/ui/performance) 모두 선택 가능하다.
- [ ] Given 로그인한 사용자가 실제 DB에 존재하는 feature(uuid)를 북마크 버튼으로 클릭했을 때, When 요청이 처리되면, Then `VALIDATION_ERROR` 없이 정상적으로 북마크된다.

### 의존성

없음(bookmark 이슈 #21~#23과는 코드 경합이 있으나 기능적으로 독립 — `assertTargetExists`의
내부 구현만 바뀌고 시그니처/동작은 동일하게 유지).
