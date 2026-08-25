# Issue #36 — [features] Feature 상세 페이지 신설

## 시그니처

### 타입 (`src/features/feature-catalog/model/types.ts`)

```typescript
export interface FeatureFile {
  file_path: string;
  code: string;
  language: string;
  sort_order: number;
}

export interface FeatureDetail extends Feature {
  summary: string;
  tags: string[];
  tech_stack: string[];
  usage: string;
  files: FeatureFile[];
}
```

### API (`src/features/feature-catalog/api/get-feature-by-id.ts`)

```typescript
export async function getFeatureById(id: string): Promise<FeatureDetail | null>;
```

- `get-features.ts`와 동일하게 mock 폴백 없음 — Supabase 미설정/에러 시 `null` 반환, 에러는
  `console.error`로 로깅.
- `features` 테이블 + `feature_files(file_path, code, language, sort_order)` 임베딩 단일 요청
  (N+1 없음).
- DB 컬럼이 도메인 타입과 1:1이라 별도 매핑 없음(`get-starter-kit-by-id.ts`와 동일 스타일).

### `FeatureCard` (`src/features/feature-catalog/ui/feature-card.tsx`)

```typescript
interface FeatureCardProps {
  feature: Feature;
  onSelect: (feature: Feature) => void;
}
```

`StarterKitCard`와 동일 구조: `<button onClick={() => onSelect(feature)}>` 래핑,
focus-visible 스타일.

### `FeatureList` (`src/features/feature-catalog/ui/feature-list.tsx`)

`'use client'` 전환. 내부에서 `useRouter().push(`/features/${feature.id}`)`로 `onSelect` 연결.
Props는 기존과 동일(`{ features: Feature[] }`).

### `FeatureCodeSection` (`src/features/feature-catalog/ui/feature-code-section.tsx`)

```typescript
interface FeatureCodeSectionProps {
  files: FeatureFile[];
}
```

`files.length === 0`이면 `null`을 반환해 섹션 자체를 렌더링하지 않는다(코드 뷰어 컴포넌트인
`StarterKitCodeViewer`는 빈 배열이어도 "등록된 코드가 없습니다" 안내를 보여주므로, "섹션 자체를
숨긴다"는 AC는 이 얇은 래퍼가 담당한다). 파일이 있으면 `<section>`으로 감싸 제목과
`StarterKitCodeViewer`를 렌더링한다.

### 페이지 (`src/app/features/[id]/page.tsx`)

```typescript
interface FeatureDetailPageProps {
  params: Promise<{ id: string }>;
}
export async function generateMetadata({ params }: FeatureDetailPageProps): Promise<Metadata>;
export default async function FeatureDetailPage({ params }: FeatureDetailPageProps);
```

- `getFeatureById(id)` → `null`이면 `notFound()`.
- `generateMetadata`: `title`/`summary` → `title`/`description`; `null`이면
  `{ title: 'Feature를 찾을 수 없습니다' }`.
- 코드 영역은 `FeatureCodeSection`에 위임한다.

## 테스트 시나리오

### `getFeatureById`

- [정상] 일치하는 Feature와 feature_files가 존재할 때 `files`가 채워진 `FeatureDetail`을
  반환해야 한다
- [정상] Feature는 존재하지만 feature_files가 없을 때 `files`가 빈 배열인 `FeatureDetail`을
  반환해야 한다
- [경계] 주어진 id와 일치하는 Feature가 없을 때 `null`을 반환해야 한다
- [예외] Supabase 조회가 에러를 반환할 때 에러를 로깅하고 `null`을 반환해야 한다
- [예외] Supabase가 설정되지 않았을 때 조회 자체를 시도하지 않고 `null`을 반환해야 한다

### `FeatureCard`

- [정상] 카드를 클릭하면 해당 feature와 함께 `onSelect`를 호출해야 한다
- [정상] 포커스된 상태에서 Enter를 누르면 해당 feature와 함께 `onSelect`를 호출해야 한다
- [정상] 포커스된 상태에서 Space를 누르면 해당 feature와 함께 `onSelect`를 호출해야 한다
- [경계] `<button>` 요소로 렌더링되고 focus-visible 스타일을 가져야 한다

### `FeatureList`

- [정상] Feature 카드를 선택하면 `/features/{id}`로 이동해야 한다

### `FeatureCodeSection`

- [정상] files가 1건 이상 있을 때 코드 뷰어를 렌더링해야 한다
- [경계] files가 빈 배열일 때 아무것도 렌더링하지 않아야 한다

### `generateMetadata`

Next.js는 `notFound()` 호출 시 `generateMetadata`가 반환한 title을 무시하고 빌트인 404
페이지 자체의 title("404: This page could not be found.")로 덮어쓴다(이 프로젝트의
`templates/[id]`도 동일한 한계를 가짐 — 별도 `not-found.tsx`가 없다). 따라서 fallback title
AC는 브라우저 최종 title이 아니라 `generateMetadata` 함수의 반환값을 직접 검증한다.

- [정상] 존재하는 Feature id일 때 `title`/`description`이 해당 Feature의 title/summary로
  설정된 Metadata를 반환해야 한다
- [예외] 존재하지 않는 Feature id일 때 fallback title("Feature를 찾을 수 없습니다")이 설정된
  Metadata를 반환해야 한다

### `FeatureDetailPage` (E2E)

DB에 feature_files가 0건인 Feature가 실제로 없어(현재 모든 Feature가 최소 1개 파일 보유), "코드
뷰어 섹션 숨김" 검증은 E2E가 아니라 위 `FeatureCodeSection` 유닛 테스트가 담당한다. E2E는 실제
Supabase 데이터로 검증 가능한 시나리오만 다룬다.

- [정상] 존재하는 Feature id로 접속하면 title/summary/description/category/tags/tech_stack/
  usage가 화면에 표시되어야 한다
- [정상] feature_files가 있을 때 코드 뷰어에 파일 내용이 표시되어야 한다
- [예외] 존재하지 않는 Feature id로 접속하면 HTTP 404를 반환해야 한다

## AC 커버리지 대조

| AC (이슈 #36)                           | 커버 시나리오                                                                |
| --------------------------------------- | ---------------------------------------------------------------------------- |
| 카드 클릭 → `/features/{id}` 이동       | `FeatureCard` 클릭 시나리오 + `FeatureList` 이동 시나리오                    |
| Enter/Space → `/features/{id}` 이동     | `FeatureCard` Enter/Space 시나리오                                           |
| 상세 페이지에 title/summary/... 표시    | E2E "title/summary/... 표시"                                                 |
| feature_files 1건 이상 → 코드 표시      | `getFeatureById` files 조회 시나리오 + E2E 코드뷰어 시나리오                 |
| feature_files 0건 → 코드 뷰어 섹션 숨김 | `getFeatureById` files 없음 시나리오 + `FeatureCodeSection` 빈 배열 시나리오 |
| 존재하지 않는 id → 404                  | `getFeatureById` null 시나리오 + E2E 404 시나리오                            |
| 존재하는 id → `<title>`이 title로 설정  | `generateMetadata` 정상 시나리오                                             |
| 존재하지 않는 id → fallback 제목        | `generateMetadata` 예외 시나리오                                             |

모든 AC가 최소 1개 시나리오로 커버됨.

## AC 검증 결과 (ac-verifier)

1차 구현 후 `ac-verifier`로 AC 8개를 독립 재검증한 결과, AC 8(fallback title)이 실제로는
**미충족**으로 판정됨: `generateMetadata`의 null 분기 반환값(`{ title: 'Feature를 찾을 수
없습니다' }`) 자체는 맞게 구현했지만, Next.js가 `notFound()` 호출 시 이 반환값을 무시하고
빌트인 404 페이지의 고정 title("404: This page could not be found.")로 덮어써서 사용자가
실제로 보는 화면은 요구사항을 충족하지 못했다(Playwright로 직접 재현 확인).

**조치**: `src/app/features/[id]/not-found.tsx`를 신규 추가해 이 라우트 전용 404 페이지와
정적 `metadata`(`{ title: 'Feature를 찾을 수 없습니다' }`)를 분리했다. `generateMetadata`의
null 분기는 `not-found.tsx` 도입 후 실행 경로상 도달하지 않지만(페이지 컴포넌트가
`notFound()`를 호출하는 순간 `not-found.tsx`의 정적 metadata가 최종 렌더링에 쓰임), 다른
호출 경로나 향후 변경에 대한 안전망으로 그대로 유지하기로 함(사용자 확인).

**Turbopack 캐시 이슈(해결됨)**: `not-found.tsx` 추가 직후 `npm run dev`(Turbopack)에서
`/features/[id]` + `not-found.tsx` 동적 라우트 조합 접속 시 `Jest worker encountered 2 child
process exceptions` 에러로 500이 발생했다. `next dev --webpack`으로 정상 동작(404 + 정확한
fallback title)을 먼저 확인한 뒤, `.next` 캐시를 삭제(`rm -rf .next`)하고 Turbopack으로
재기동하니 동일하게 정상 동작함을 확인했다 — Turbopack 자체 버그가 아니라 `not-found.tsx`
신규 추가를 기존 `.next` 증분 캐시가 제대로 반영하지 못한 캐시 오염 문제였다. 최종적으로
Turbopack(`npm run dev`, 이 프로젝트의 기본/CI 경로)에서 전체 E2E 17개(신규 3개 포함) 통과.
