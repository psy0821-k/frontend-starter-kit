# features 도메인 DB 연동 PRD

원본: [spec-original.md](./spec-original.md) · 확정 스펙: [spec-fixed.md](./spec-fixed.md)

---

## 개요

`src/features/feature-catalog/`가 쓰던 정적 배열(`FEATURES`, 8건, 문자열 id)을 원격
Supabase에 이미 존재하는 `features` 테이블(uuid PK, 15건)로 전환한다. 이번 범위는 `/features`
목록 조회뿐이며, 상세 페이지·관리자 CRUD UI는 포함하지 않는다. 선행 작업으로 로컬 저장소에
누락되어 있던 마이그레이션 4개(010~013)를 실제 DB 스키마에서 역산해 복원한다.

## 사용자 스토리

1. 방문자는 `/features`에 접속하면 실제 DB에 등록된 Feature(현재 15건)를 카드로 확인한다.
2. 방문자는 검색어/카테고리(8개)로 필터링하고 페이지네이션을 이용할 수 있다(기존 로직 유지).
3. Supabase 연결이 끊기거나 미설정이거나 실제 등록된 Feature가 없을 때, 방문자는 모두 동일한
   "등록된 Feature가 없습니다" 안내를 보며, mock 데이터가 대신 보이지 않는다.
4. 개발자(이 저장소를 유지보수하는 사람)는 로컬에서 `supabase/migrations/`를 순서대로 재생해
   원격과 동일한 `features`/`feature_files` 스키마를 재현할 수 있다.

## 구현 계획

| 영역                         | 구현 위치                                                                           | 비고                                                                                                                                                                                        |
| ---------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 마이그레이션 복원            | `supabase/migrations/010_features_schema.sql` ~ `013_features_add_usage.sql` (신규) | DB에서 역산, 멱등                                                                                                                                                                           |
| Feature 타입 변경            | `src/features/feature-catalog/model/types.ts` (수정)                                | `id`를 uuid로, `FEATURE_CATEGORIES` 8개로 확장                                                                                                                                              |
| DB 조회 API                  | `src/features/feature-catalog/api/get-features.ts` (신규)                           | `get-starter-kits.ts`와 동일한 시그니처 스타일                                                                                                                                              |
| 목록 페이지 연동             | `src/app/features/page.tsx` (수정)                                                  | 정적 `FEATURES` import 제거, `await getFeatures()` 호출                                                                                                                                     |
| 빈 상태 UI                   | `src/features/feature-catalog/ui/feature-empty-state.tsx` (신규)                    | `StarterKitEmptyState`와 동일 패턴                                                                                                                                                          |
| 정적 데이터 정리             | `src/features/feature-catalog/model/data.ts` (삭제)                                 | 아래 교차 의존성 항목 참고                                                                                                                                                                  |
| 테스트 픽스처                | `src/features/feature-catalog/model/test-fixtures.ts` (기존, 필요 시 uuid 반영)     | 기존 유닛 테스트가 참조 중이면 조정                                                                                                                                                         |
| bookmark의 feature 검증 수정 | `src/app/api/bookmarks/route.ts`의 `assertTargetExists` (수정)                      | 교차 의존성 — `data.ts`의 정적 `FEATURES` 대신 `features` 테이블을 직접 조회하도록 변경. `data.ts` 삭제 시 이 함수의 import가 깨지므로 같은 이슈에서 함께 처리한다(사용자 결정, 2026-08-21) |

## 기술 결정

### 결정 1 — Supabase 조회 실패/미설정/실제 0건의 반환 방식

**Context** — spec-fixed.md §5는 "미설정/에러/실제 0건 모두 동일한 빈 상태를 보여준다"고
확정했다. 하지만 구현 레벨에서 이 세 가지를 `getFeatures()`가 어떤 반환값으로 표현할지는
아직 정해지지 않았다 — 단순히 셋 다 빈 배열을 반환하면 되는지, 아니면 에러 여부를 구분할
수단이 필요한지가 쟁점이다.

| #   | 기준                 | 안 A: 셋 다 빈 배열(`Feature[]`) 반환                                                                                                 | 안 B: `{ features, hasError }` 형태로 에러 여부 구분 반환                                                                         | 안 C: 에러 시 예외를 던지고 페이지에서 catch                                                                                                 |
| --- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 데이터 구조          | `Promise<Feature[]>`, 항상 배열                                                                                                       | `Promise<{ features: Feature[]; hasError: boolean }>`                                                                             | `Promise<Feature[]>`, 실패 시 throw                                                                                                          |
| 2   | API 레이어 변경지점  | `get-features.ts` 내부에서 미설정/에러 모두 `[]` 반환 후 종료                                                                         | 반환 타입 자체가 튜플성 객체로 바뀜                                                                                               | 에러 분기에서 `throw`                                                                                                                        |
| 3   | 상태관리 변경지점    | 없음                                                                                                                                  | 없음                                                                                                                              | 없음(서버 컴포넌트 try/catch)                                                                                                                |
| 4   | 핵심 동작            | 호출부는 배열 길이만 보고 `FeatureEmptyState` 분기                                                                                    | 호출부가 `hasError`를 UI에 활용할지 말지 추가 판단 필요                                                                           | `page.tsx`가 try/catch로 감싸고 에러 시에도 같은 빈 상태 렌더                                                                                |
| 5   | 컴포넌트 구조        | `FeaturesPage`는 `features.length === 0` 한 줄로 분기                                                                                 | `FeaturesPage`가 `hasError`를 받아도 결국 spec-fixed.md 요구대로 무시하고 동일 UI를 그림(사실상 안 A와 결과 동일, 정보만 더 가짐) | `FeaturesPage`에 `try { } catch { }` 블록 추가, 서버 컴포넌트에서 예외 처리 패턴이 다른 페이지(`templates`, `list`)와 달라짐                 |
| 6   | 기존 패턴과의 일관성 | `get-starter-kits.ts`가 에러 시 `MOCK_STARTER_KITS`(항상 성공하는 배열)를 반환하는 것과 "항상 배열을 반환한다"는 시그니처 형태가 동일 | 기존 어떤 `get-*.ts` 함수도 이런 튜플 객체를 반환하지 않음 — 새 패턴 도입                                                         | 기존 `get-*.ts` 함수들은 전부 에러를 삼키고 대체값을 반환하지, throw하지 않음 — 이질적                                                       |
| 7   | 테스트 용이성        | `getFeatures()`가 순수하게 배열만 반환해 단위 테스트가 가장 단순                                                                      | 반환 객체의 `hasError` 필드까지 검증해야 하지만 실제로 쓰이는 곳이 없어 죽은 값이 됨                                              | 에러 케이스 테스트 시 `rejects.toThrow()` 필요, 서버 컴포넌트 테스트가 이 프로젝트에서 애초에 어려움(async 서버 컴포넌트는 Vitest 대상 아님) |

**Decision** — 안 A. `getFeatures()`는 Supabase 미설정, 조회 에러, 실제 0건 세 경우 모두
`[]`를 반환하는 단일 `Promise<Feature[]>` 시그니처로 통일한다. `FeaturesPage`는 반환된 배열의
길이만으로 `FeatureEmptyState` 분기를 판단한다(`get-starter-kits.ts`의 시그니처 스타일을
그대로 따름).

**Alternatives**

- 안 B(`hasError` 튜플): spec-fixed.md가 이미 "세 경우를 구분하지 않고 동일하게 보여준다"고
  확정했으므로, `hasError` 정보를 만들어도 UI 어디에서도 실제로 사용되지 않는 죽은 데이터가
  된다. 사용되지 않는 필드를 시그니처에 넣는 것은 YAGNI 위반이다. 기각.
- 안 C(예외 throw): 기존 `get-starter-kits.ts`/`get-starter-kit-by-id.ts` 모두 Supabase 에러를
  삼키고 대체값을 반환하는 방식이라, 이 함수만 throw하면 호출부(서버 컴포넌트)마다 에러 처리
  방식이 달라져 일관성이 깨진다. 기각.

**Consequences**

- 장점: 시그니처가 `Feature[]` 하나로 가장 단순하고, 기존 `get-starter-kits.ts` 패턴과 완전히
  동일해 다음에 이 코드를 보는 사람이 새로 학습할 것이 없다.
- 단점: `getFeatures()` 내부에서 실제 DB 에러가 발생했는지(예: RLS 정책 문제, 네트워크 문제)를
  호출부가 알 수 없다 — 운영 중 실제로는 데이터가 있는데 조회 실패로 빈 화면이 떠도 사용자는
  "그냥 없다"고 인식하게 된다. 이 문제는 서버 로그(console.error 등, §Out of Scope에 명시)로
  개발자만 확인 가능하도록 완화하되, 사용자에게 노출되는 UI 텍스트는 바꾸지 않는다.

## Out of Scope

spec-fixed.md §7의 Out of Scope를 그대로 따른다. 추가되는 항목:

- `getFeatures()` 내부 에러의 사용자 대상 노출(예: "일시적 오류입니다" 같은 별도 문구) — 결정
  1에 따라 UI는 항상 동일한 빈 상태 문구만 보여준다. 서버 콘솔 로깅(`console.error`) 수준의
  개발자용 가시성만 추가할 수 있으며, 이것도 필수는 아니다.
- bookmark 기능의 `assertTargetExists` DB 조회 전환은 이번 이슈 범위에 **포함**한다(교차
  의존성 때문에 분리 불가 — 위 구현 계획 표 참고). 단, bookmark의 다른 부분(Route Handler의
  나머지 로직, UI 등)은 건드리지 않는다.

## 용어 정의

spec-fixed.md의 용어 정의를 그대로 따른다.

## 관련 문서

- [spec-original.md](./spec-original.md) — 초기 아이디어
- [spec-fixed.md](./spec-fixed.md) — 확정 요구사항, 마이그레이션 복원 상세, 용어 정의
