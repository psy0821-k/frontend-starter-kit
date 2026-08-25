# Feature 상세 페이지 PRD

**확정 스펙**: [spec-fixed.md](./spec-fixed.md)

## 개요

`/features` 목록의 각 카드가 상세 페이지(`/features/[id]`)로 이동하도록 하고, 목록에서
보여주지 않던 Feature 정보(요약/태그/기술스택/사용법/코드)를 상세 페이지에서 보여준다.
`docs/features/feature-catalog-db/spec-fixed.md` §7에서 Out of Scope로 남겨뒀던 항목을
해소하는 후속 작업이다.

## 사용자 스토리

1. 방문자로서, `/features` 목록에서 관심 있는 카드를 클릭하면 그 Feature의 전체 정보를 볼 수
   있다.
2. 방문자로서, 상세 페이지에서 그 Feature가 어떤 파일들로 구성되어 있는지, 실제 코드는 어떻게
   생겼는지 확인할 수 있다.
3. 로그인한 사용자로서, 상세 페이지에서 바로 북마크를 추가/해제해 나중에 마이페이지에서 다시
   찾아볼 수 있다.
4. 방문자로서, 존재하지 않는 Feature id로 접근하면 404를 본다(검색엔진에도 그렇게 보고된다).

## 기술 결정

### 아키텍처 3안 비교

**안 A — 기존 패턴 그대로 답습**: `FeatureCard`에 `StarterKitCard`와 동일한
`onSelect` prop을 추가하고, `FeatureList`(또는 상위 클라이언트 컴포넌트)에서
`useRouter().push()`로 이동시킨다. 코드 뷰어는 `StarterKitCodeViewer`를 타입만
호환되면 직접 import해 재사용한다.

**안 B — Feature 전용 컴포넌트 신규 작성**: `FeatureCodeViewer`, `FeatureDetailHeading`
등 이름부터 Feature 전용으로 새로 만들고, `StarterKit` 쪽 컴포넌트는 건드리지 않는다.

**안 C — `<Link>` 기반 네이티브 이동**: `FeatureCard` 전체를 `next/link`의 `<Link>`로
감싸 브라우저 네이티브 링크로 만든다(`onSelect`/`useRouter` 없이). 코드 뷰어는 안 A와
동일하게 `StarterKitCodeViewer` 재사용.

| #   | 기준                 | 안 A (기존 패턴 답습)                                                                               | 안 B (Feature 전용 신규)                                | 안 C (Link 기반)                                                                                        |
| --- | -------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 1   | 데이터 구조          | `FeatureDetail`/`FeatureFile` 신규 타입(spec-fixed.md 확정) — 3안 공통                              | 공통                                                    | 공통                                                                                                    |
| 2   | API 레이어 변경지점  | `get-feature-by-id.ts` 신규(공통), `getStarterKitById`와 동일 시그니처 스타일                       | 공통                                                    | 공통                                                                                                    |
| 3   | 상태관리 변경지점    | 없음(서버 컴포넌트 + 클라이언트는 카드 클릭 상태만)                                                 | 없음                                                    | 없음 — `<Link>`는 클라이언트 상태 자체가 불필요                                                         |
| 4   | 핵심 동작(이동)      | `onClick` → `router.push()` (JS 네비게이션, prefetch는 Next.js가 `<Link>`가 아니면 자동 처리 안 함) | 동일(안 A와 같음)                                       | 네이티브 `<a href>` — 브라우저 기본 동작(가운데 클릭 새 탭, 우클릭 메뉴, prefetch 자동)이 공짜로 따라옴 |
| 5   | 컴포넌트 구조        | `FeatureCard` 수정 + `feature_files` 타입만 맞으면 `StarterKitCodeViewer` 재사용                    | `FeatureCard` 수정 + 새 컴포넌트 2~3개 추가             | `FeatureCard` 수정(구조 더 단순, `<button>` → `<Link>`) + `StarterKitCodeViewer` 재사용                 |
| 6   | 기존 패턴과의 일관성 | `StarterKitCard`와 완전히 동일한 패턴 — 이미 있는 컨벤션을 그대로 따름                              | 낮음 — 같은 목적의 컴포넌트가 프로젝트에 2벌 생김(중복) | `StarterKitCard`와 이동 방식만 다름(개선이지만 비대칭 발생)                                             |
| 7   | 테스트 용이성        | 기존 `StarterKitCard.test.tsx`(Enter/Space 키보드 테스트 포함)를 그대로 본떠 작성 가능              | 테스트도 새로 작성해야 함, 커버리지 중복                | `<Link>`는 RTL에서 `getByRole('link')`로 더 간단히 검증 가능, 키보드 접근성도 브라우저가 보장           |

**권장**: 안 A. CLAUDE.md의 "2회 규칙"(같은 요구가 재현되면 승격) 관점에서, `StarterKitCard`의
`onSelect` 패턴이 정확히 두 번째로 재현되는 사례다 — 억지로 새 패턴(B)을 만들 이유가 없고,
더 나은 대안(C)이 있다면 그건 오히려 `StarterKitCard` 쪽도 함께 개선해야 할 기존 부채이지
이번 Feature 상세 페이지 하나만의 결정으로 넘기기엔 범위가 넘어간다(templates 카드 클릭
동작을 바꾸는 건 이번 PRD의 범위 밖).

### 기술 결정 — 안 A 채택

**Context**: `/features` 목록 카드를 상세 페이지로 연결해야 한다. 이미 대칭 도메인인
`/templates` 목록의 `StarterKitCard`가 `onSelect` + `useRouter().push()` 패턴으로 동일한
문제를 풀고 있다.

**Decision**: `FeatureCard`에 `onSelect` prop을 추가하고, `StarterKitCard`와 동일한 구조
(button 래핑, focus-visible 스타일, Enter/Space 지원)로 맞춘다. 코드 뷰어는
`StarterKitCodeViewer`를 `FeatureFile[]`에 그대로 재사용한다(타입 구조 호환 확인 완료 —
`is_entry`가 optional이라 `FeatureFile`이 `TemplateFile`의 부분 집합으로 들어맞음).

**Alternatives**:

- 안 B(Feature 전용 신규) — 기각. 코드 뷰어를 포함해 이미 존재하는 컴포넌트와 완전히 동일한
  목적의 컴포넌트를 새로 만드는 것은 DRY 위반이며, `shared`/`components` 승격 기준인
  "2회 규칙"의 취지(중복 구현 방지)와도 반대 방향이다.
- 안 C(`<Link>` 기반) — 이번 PRD에서는 기각하되, 이유는 "안 좋아서"가 아니라 "범위 문제".
  `StarterKitCard`도 똑같이 `<button onClick>` 구조라 이 개선을 Feature에만 적용하면 두
  카드의 이동 방식이 갈라진다(일관성 훼손). `<Link>` 전환은 templates까지 포함하는 별도
  리팩토링 이슈로 다루는 것이 맞다.

**Consequences**:

- 장점: 기존 `StarterKitCard`/`StarterKitCodeViewer` 테스트 스위트와 패턴을 그대로 재사용해
  구현·리뷰 비용이 최소화된다. 두 카드 컴포넌트의 동작이 동일하게 유지된다.
- 단점: `onSelect` + `router.push()` 방식은 `<Link>` 대비 Next.js의 자동 prefetch, 브라우저
  네이티브 컨텍스트 메뉴(새 탭에서 열기 등)를 지원하지 않는다는 기존 한계를 Feature 카드에도
  그대로 물려받는다. 이 한계는 이번 PRD의 책임 범위가 아니라 기존 `StarterKitCard` 설계의
  연장선이다.

## Out of Scope

- **관리자 등록/수정/삭제 UI** — spec-fixed.md에서 확정. `create_feature`/`update_feature`
  RPC를 호출하는 폼은 이번에 만들지 않는다.
- **목록(`/features`) 조회 쿼리 변경** — `getFeatures()`는 4개 필드만 계속 조회한다.
- **`feature_files` 코드의 문법 하이라이팅** — `StarterKitCodeViewer`의 기존 제약(XSS 표면
  축소)을 그대로 물려받는다.
- **`StarterKitCard`/`FeatureCard`의 `<Link>` 전환** — 위 ADR에서 기각한 안 C. 별도
  리팩토링 이슈로 분리한다(이번 범위 아님).
- **`FeatureCard`의 카테고리 배지 색상/디자인 변경** — 기존 스타일 유지, 클릭 가능하게
  만드는 것 외의 시각적 변경은 하지 않는다.
- **Open Graph 이미지, `generateMetadata`의 `parent` 확장(부모 메타데이터 병합) 등 고급
  메타데이터 기능** — SEO는 포함하되, `title`/`description`만 다룬다(아래 참고).

## SEO — `generateMetadata` 도입

- 이 프로젝트 최초의 `generateMetadata` 도입이다(기존에는 `app/layout.tsx`의 정적
  `metadata` 객체만 존재, `templates/[id]`도 아직 없음).
- `src/app/features/[id]/page.tsx`에 `generateMetadata({ params })`를 추가한다.
  `getFeatureById(id)`로 조회한 `title`/`summary`를 각각 `title`/`description`으로 매핑한다.
- Feature를 찾지 못하면(`null`) 정적 fallback(`title: 'Feature를 찾을 수 없습니다'`)을
  반환한다 — `notFound()` 호출과 별개로 메타데이터 자체도 존재하지 않는 리소스를 인덱싱하지
  않도록 처리한다.
- `getFeatureById`가 이미 상세 페이지 본문 렌더링에서도 호출되므로, Next.js의
  `generateMetadata`/페이지 컴포넌트 간 fetch 중복 제거(dedup) 동작에 의존한다(별도 캐싱
  레이어를 새로 만들지 않음 — YAGNI).
- `templates/[id]`에 동일 패턴을 소급 적용하는 것은 이번 범위가 아니다(위 Out of Scope의
  `<Link>` 전환과 같은 이유로 별도 이슈).

## 용어 정의

spec-fixed.md 참고.
