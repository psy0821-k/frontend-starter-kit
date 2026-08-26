# Issue #44 — 랜딩페이지: 기본 골격 + 텍스트 설명 섹션 + SEO 메타데이터

## 시그니처

```ts
// src/features/landing/ui/landing-page.tsx
export function LandingPage(): ReactElement;
```

- Props 없음 — 이번 이슈 범위는 정적 텍스트 설명 섹션만(비디오는 #45, 캐러셀은 #46에서 추가 예정).
- 반응형: 모바일 1컬럼 → `sm:`/`md:` 확대(모바일 퍼스트).

```ts
// src/app/page.tsx
export const metadata: Metadata = {
  title: 'Frontend Starter Platform',
  description: '...',
  openGraph: {
    title: 'Frontend Starter Platform',
    description: '...',
    images: ['/og-image.png'],
  },
};

export default function Home(): ReactElement; // LandingPage만 렌더링하는 얇은 wrapper
```

- 기존 `getStarterKits`/`groupStarterKitsByCategory`/`StarterKitList` 사용 제거(전체 교체).
- 기존 카테고리별 목록 UI는 `/templates`(`src/app/templates/(list)/page.tsx`)가 검색·필터·
  무한스크롤까지 갖춘 상위 호환으로 이미 존재하므로 별도 이관 없이 삭제.

## 신규/영향 파일

- `src/features/landing/ui/landing-page.tsx` (신규)
- `src/app/page.tsx` (전체 교체)
- `public/og-image.png` (신규, 플레이스홀더)

## 에러 케이스

없음 — 정적 컴포넌트, 외부 데이터 조회 없음.

## 테스트 시나리오

### LandingPage

- [정상] LandingPage를 렌더링하면 플랫폼을 소개하는 제목과 설명 텍스트가 화면에 보여야 한다
- [정상] LandingPage를 렌더링하면 텍스트 섹션이 시맨틱 heading(`h1`)을 포함해야 한다
- [경계] 모바일 뷰포트에서 LandingPage를 렌더링하면 텍스트 섹션이 한 컬럼 레이아웃 클래스를 가져야 한다

### Home (src/app/page.tsx)

- [정상] Home을 렌더링하면 LandingPage의 텍스트 설명이 화면에 보여야 한다
- [정상] Home을 렌더링하면 기존 스타터킷 카테고리별 목록(StarterKitList)이 더 이상 렌더링되지 않아야 한다

### metadata (src/app/page.tsx)

- [정상] metadata의 title이 'Frontend Starter Platform'이어야 한다
- [정상] metadata의 description이 비어있지 않은 문자열이어야 한다
- [정상] metadata.openGraph.images에 OG 이미지 경로가 포함되어야 한다
- [정상] metadata.openGraph.title/description이 기본 title/description과 일치해야 한다

## AC 커버리지

| AC                                                                | 커버 시나리오                                                            |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 방문자가 `/`에 접속했을 때 플랫폼 소개 텍스트(제목+설명)가 보인다 | LandingPage [정상] 제목/설명 텍스트, Home [정상] LandingPage 텍스트 노출 |
| 모바일 뷰포트에서 텍스트 섹션이 한 컬럼으로 배치된다              | LandingPage [경계] 모바일 한 컬럼 레이아웃                               |
| `<head>`에 title/description/OG 이미지 메타태그가 존재한다        | metadata [정상] title, description, openGraph.images 3개 시나리오        |

모든 AC가 시나리오로 커버됨.
