# Feature 상세 페이지 — 확정 요구사항

**상태**: 확정 (2026-08-24)
**원본**: [spec-original.md](./spec-original.md)
**선행 문서**: [docs/features/feature-catalog-db/spec-fixed.md](../feature-catalog-db/spec-fixed.md) §7 —
이번 기능이 그 문서의 Out of Scope 항목을 해소한다.

## 배경

`/features` 목록의 `FeatureCard`는 현재 클릭해도 아무 동작이 없다(주석에 "상세 페이지
없음"으로 명시된 의도된 동작). `features`/`feature_files` 테이블은 이미 DB에 대칭 구조로
존재하지만(`templates`/`template_files`와 동일 패턴), 상세 조회·페이지·코드 뷰어가 아직
없다. 이번 기능은 그 상세 페이지를 신설한다.

## 용어 정의 (Ubiquitous Language)

| 용어                | 의미                                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------------------- |
| Feature 상세 페이지 | `/features/[id]` — Feature 하나의 전체 정보(요약/설명/태그/기술스택/사용법/코드)를 보여주는 페이지            |
| FeatureFile         | Feature를 구성하는 파일 하나. `file_path` + `code` + `language` + `sort_order` (템플릿의 TemplateFile과 대칭) |

## 최소 동작 시나리오

1. 사용자가 `/features` 목록에서 카드를 클릭(또는 Enter/Space)하면 `/features/{id}`로 이동한다.
2. `/features/{id}`에 접속하면 해당 Feature의 `title`/`summary`/`description`/`category`/`tags`/
   `tech_stack`/`usage`와, 구성 파일(`feature_files`) 코드를 함께 보여준다.
3. 로그인한 사용자는 상세 페이지에서 바로 북마크를 추가/해제할 수 있다(`BookmarkButton`,
   `target_type: 'feature'`).
4. 존재하지 않는 id로 접근하면 404 상태코드를 반환한다(`notFound()`).

## 데이터 구조

### `Feature` 타입 확장

목록 조회(`getFeatures`)는 기존 4개 필드(`id`/`title`/`description`/`category`)만 유지한다
(카드가 쓰지 않는 컬럼은 여전히 목록 쿼리에 포함하지 않음 — `feature-catalog-db` §4.1 유지).

상세 조회 전용 타입을 새로 추가한다:

```typescript
export interface FeatureDetail extends Feature {
  summary: string;
  tags: string[];
  techStack: string[];
  usage: string;
  files: FeatureFile[];
}

export interface FeatureFile {
  file_path: string;
  code: string;
  language: string;
  sort_order: number;
}
```

- DB 컬럼은 snake_case(`tech_stack`)이지만 도메인 타입은 기존 `StarterKit`과의 일관성을 위해
  `techStack`으로 camelCase 매핑한다(`StarterKit`은 현재 필드명을 DB와 동일하게 snake_case로
  쓰고 있으나, `tags`/`tech_stack`은 이미 배열 문자열이라 매핑 비용이 낮고, Feature는 신규
  타입이라 이번 기회에 프로젝트 전역 네이밍 규칙(camelCase)에 맞춘다 — PRD 단계에서 최종
  확정).

### API 레이어

- `src/features/feature-catalog/api/get-feature-by-id.ts` 신규.
  `export async function getFeatureById(id: string): Promise<FeatureDetail | null>`
- `getStarterKitById`와 동일한 패턴: PostgREST 임베딩으로 `feature_files`를 함께 조회(단일
  요청, N+1 없음), 찾지 못하면 `null` 반환.
- Supabase 미설정 시 처리: `feature-catalog-db`가 이미 "mock 폴백 없음, 빈 상태로 통일"을
  사용자 결정으로 확정했으므로, 상세 조회도 동일하게 **mock 폴백 없이 null 반환**(목록과
  일관성 유지).

## UI 구성

- `src/app/features/[id]/page.tsx` 신규 — `templates/[id]/page.tsx`와 동일한 구조(서버
  컴포넌트, `Promise.all`로 병렬 조회, `notFound()` 분기).
- `FeatureCard`를 클릭 가능하게 변경: `StarterKitCard`와 동일하게 `onSelect` prop을 받는
  `<button>` 래핑 구조로 바꾸고, 호출부(`FeatureList` 또는 상위 컨테이너)에서
  `router.push(`/features/${feature.id}`)`를 연결한다.
- 코드 뷰어: `StarterKitCodeViewer`를 그대로 재사용(props 형태가 호환되면 직접 재사용, 아니면
  `feature_files` 형태에 맞춘 얇은 어댑터만 추가 — PRD 단계에서 재사용 가능 여부 확인 후 결정).
- 북마크: `BookmarkButton`(`target: { targetType: 'feature', targetId: feature.id }`)을
  상세 페이지 헤더 영역에 배치. `getBookmarkStateForServer`로 서버에서 초기 상태 조회.
- 404: `getFeatureById`가 `null`을 반환하면 `notFound()` 호출.

## Out of Scope (1차 확정 후보 — PRD 단계에서 최종 확정)

- **관리자 등록/수정/삭제 UI** — features는 아직 등록 폼 자체가 없다. `create_feature`/
  `update_feature` RPC를 호출하는 UI는 이번에 만들지 않는다.
- **목록(`/features`) 조회 쿼리 변경** — 목록은 여전히 4개 필드만 조회(기존 유지).
- **feature_files 코드의 문법 하이라이팅** — `StarterKitCodeViewer`가 이미 안 하고 있음(XSS
  표면 축소 이유), 동일하게 유지.
- **Feature 상세 페이지의 SEO/메타데이터 최적화** — 이번 범위는 기능 동작까지만.

## 경계 조건

- `feature_files`가 0건인 Feature(코드 없이 설명만 있는 경우) — 코드 뷰어 섹션 자체를
  숨긴다(템플릿에서 파일이 항상 최소 1개 이상 강제되는 것과 달리 features는 그런 제약이 DB에
  없으므로 방어적으로 처리).
- 비로그인 사용자가 상세 페이지에 접근 — 조회 자체는 그대로 허용(공개 정보), 북마크 버튼
  클릭 시에만 로그인 페이지로 유도(`BookmarkButton`의 기존 `isAuthenticated` 분기 재사용).
