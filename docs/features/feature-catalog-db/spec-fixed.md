# features 도메인 DB 연동 — 확정 요구사항

**작성일**: 2026-08-21
**상위 문서**: [spec-original.md](./spec-original.md)

---

## 1. 개요

`src/features/feature-catalog/`가 쓰던 정적 배열(`FEATURES`, 8건, 문자열 id)을 걷어내고,
원격 Supabase에 이미 존재하는 `features`/`feature_files` 테이블(uuid PK, 15건, `templates`와
대칭 구조)을 실제 데이터 소스로 사용한다. 이번 범위는 **목록(`/features`) 조회만** DB로
전환한다 — 상세 페이지, 관리자 등록/수정/삭제 UI는 포함하지 않는다.

---

## 2. 마이그레이션 파일 복원 (선행 작업)

원격에는 `010_features_schema`, `011_features_add_categories`, `012_features_update_function`,
`013_features_add_usage` 마이그레이션이 이미 적용되어 있었으나, 로컬 `supabase/migrations/`에
해당 `.sql` 파일이 없었다. 실제 DB 스키마(`pg_policies`, `information_schema`, `pg_constraint`,
`pg_indexes`, 함수 정의)를 조회해 역산 재구성했다:

- `010_features_schema.sql` — `features`/`feature_files` 테이블, 인덱스, RLS, `create_feature`/
  `update_feature`/`freeze_feature_immutables` 함수(모두 `templates`와 동일 패턴, `search_path`
  고정 포함).
- `011_features_add_categories.sql` — `features_category_check`를 5개(search/board/comment/
  payment/notification)에서 8개(+form/ui/performance)로 확장.
- `012_features_update_function.sql` — `009_fix_security_advisors.sql`과 동일한 보안 강화
  이력(로직 변화 없음, no-op으로 재적용됨 — 010 작성 시점에 이미 최종 상태를 반영했기 때문).
- `013_features_add_usage.sql` — `usage`(사용 방법 설명) 컬럼 추가, RPC 함수 갱신.

이 4개 파일은 이미 원격에 적용된 상태와 실제로 일치하는지 재확인 후(멱등 `create or replace`,
`if not exists` 사용) 커밋한다. **재실행해도 원격 DB에 추가 변경이 발생하지 않는다**(멱등).

---

## 3. 최소 동작 시나리오

1. 사용자가 `/features`에 접속하면 실제 DB의 `features` 테이블에서 조회한 데이터가 카드로
   표시된다.
2. Supabase가 설정되지 않았거나, 조회 중 에러가 발생하거나, 실제로 등록된 Feature가 0건이면
   — 이 세 경우 모두 **동일한 빈 상태 UI**("등록된 Feature가 없습니다")를 보여준다. mock
   데이터로 대체하지 않는다.
3. 검색어/카테고리 필터/페이지네이션은 기존 로직(`filter-by-search.ts`, `filter-by-category.ts`,
   `paginate.ts`)을 그대로 재사용한다 — DB 조회 후 클라이언트 사이드 필터링 방식은 유지한다
   (§7 Out of Scope 참고, 데이터 규모가 15건 수준이라 서버 사이드 필터링은 과함).

---

## 4. 데이터 구조 변경

### 4.1 `Feature` 타입

```typescript
export interface Feature {
  id: string; // uuid로 변경 (기존: 'search' 같은 slug)
  title: string;
  description: string; // DB 컬럼명은 description(기존 필드명과 동일하게 유지)
  category: FeatureCategory;
}
```

- DB의 `summary`, `tags`, `tech_stack`, `usage` 컬럼은 이번 목록 조회 범위에서 **가져오지 않는다**
  (카드가 쓰지 않는 필드는 페이로드에서 제외 — `getStarterKits`가 목록에서 `template_files`를
  조인하지 않는 것과 동일한 이유).

### 4.2 카테고리 확장

```typescript
export const FEATURE_CATEGORIES = [
  'search',
  'board',
  'comment',
  'payment',
  'notification',
  'form',
  'ui',
  'performance',
] as const;
```

DB의 `features_category_check` 제약과 동일한 8개로 확장한다.

---

## 5. API 레이어

- `src/features/feature-catalog/api/get-features.ts` 신규 추가. `get-starter-kits.ts`와
  동일한 시그니처 스타일: `export async function getFeatures(): Promise<Feature[]>`.
- Supabase 미설정(`isSupabaseConfigured() === false`) 또는 조회 에러(`error !== null`) 시
  **빈 배열**을 반환한다(mock 폴백 없음 — §7 Out of Scope, 사용자 결정 사항).
- `src/app/features/page.tsx`가 정적 `FEATURES` import 대신 `await getFeatures()`를 호출하도록
  변경한다(서버 컴포넌트, 기존 `templates/page.tsx`의 `await getStarterKits()` 패턴과 동일).

---

## 6. 빈 상태 UI

- 신규 `FeatureEmptyState` 컴포넌트(`src/features/feature-catalog/ui/feature-empty-state.tsx`)를
  추가한다. `StarterKitEmptyState`와 동일한 패턴(아이콘 + "등록된 Feature가 없습니다" + 안내
  문구)이며, Supabase 미설정/에러/실제 0건 세 경우 모두 이 컴포넌트로 렌더링한다.
- 기존 `FeatureFilteredEmptyState`(검색/카테고리 필터 결과가 0건일 때)는 그대로 유지한다 —
  "전체 데이터가 없음"과 "필터링 결과가 없음"은 다른 상황이므로 문구도 구분된다.
- 분기 기준: `getFeatures()`가 반환한 전체 목록이 0건이면 `FeatureEmptyState`, 전체는 있지만
  필터링 후 0건이면 기존 `FeatureFilteredEmptyState`(현재 `FeaturesPage`의 분기 로직과 동일한
  위치에서 조건만 바뀜).

---

## 7. Out of Scope (1차 확정 후보 — 단계 2에서 최종 확정)

- **상세 페이지(`/features/[id]`)** — 이번 범위는 목록 조회만.
- **관리자 등록/수정/삭제 UI** — `create_feature`/`update_feature` RPC와 DB 함수는 이미
  존재하지만, 이를 호출하는 프론트엔드 폼/버튼은 이번에 만들지 않는다.
- **mock 데이터 폴백** — `get-starter-kits.ts`와 달리 mock으로 대체하지 않고 빈 상태로
  통일한다(사용자 결정: "DB를 연결하고, 데이터가 없으면 없다고 보여준다").
- **서버 사이드 필터링/검색/페이지네이션** — 클라이언트 사이드 필터링 유지(데이터 규모가 작음).
- **summary/tags/tech_stack/usage 등 목록 카드에 쓰지 않는 컬럼의 조회** — 상세 페이지가
  생길 때 함께 다룬다.
- **기존 `list`/`search` feature 문서(spec-fixed.md 등)의 소급 수정** — "features는 정적
  데이터"라는 그 문서들의 전제가 이번 전환으로 stale해지지만, 이번 범위에서 그 문서들을
  고치지 않는다(별도 정리 필요 시 후속 작업).

---

## 8. 용어 정의 (Ubiquitous Language)

| 용어                 | 의미                                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Feature              | 특정 페이지에 종속되지 않는 재사용 가능한 기능 모듈. 이제 DB(`features` 테이블)에서 조회한다                        |
| 빈 상태(Empty State) | Supabase 미설정/조회 에러/실제 데이터 0건을 구분하지 않고 통일해서 보여주는 "등록된 Feature가 없습니다" UI          |
| 필터링 결과 없음     | 전체 데이터는 있으나 검색어/카테고리 조건에 맞는 항목이 없는 상태(빈 상태와 별개, 기존 `FeatureFilteredEmptyState`) |
