# 템플릿 상세 페이지 디자인 노트

> ⚠️ **v1(iframe) 폐기 안내**: 이 문서 전체는 라이브 프리뷰를 **배포 URL을 iframe으로 embed**하는
> 방식(`preview_url` 필드, `TemplatePreviewSection` 컴포넌트)을 전제로 작성되었다. 이후 방향이
> **Sandpack 기반 브라우저 내 즉석 렌더링**(`is_entry` 필드, `TemplateLivePreview` 컴포넌트,
> [spec-fixed.md](./spec-fixed.md) v2 참조)으로 완전히 교체되면서, 아래 내용(iframe `title`/`sandbox`
> 속성, "새 창에서 열기" 링크, `preview_url` 검증 등)은 **더 이상 실제 코드에 대응하지 않는다**.
> 참고용 이력으로만 남겨두며, 실제 구현 기준 결정 사항은 [prd.md](./prd.md)(v2)를 따른다.
> Sandpack 도입에 따른 접근성·디자인 재검토는 아직 이 문서에 별도로 반영되지 않았다 — 후속 갱신 필요.

기능 정의: [spec-fixed.md](./spec-fixed.md) · 기술 결정: [prd.md](./prd.md) · 공통 디자인 규칙: [docs/design/index.md](../../design/index.md) · 목록 페이지 디자인 노트: [templates/design.md](../../design.md)

이 문서는 공통 디자인 규칙(`docs/design/*.md`)과 목록 페이지 디자인 노트를 반복하지 않고, `/templates/[id]` 상세 페이지 — 특히 이번에 신규 도입되는 라이브 프리뷰(iframe) — 에서만 발생하는 디자인·접근성·구현 결정만 다룬다.

---

## page 정의

```yaml
page:
  purpose: 특정 스타터 킷 1개의 상품요약·라이브 프리뷰·기술·코드를 깊게 확인
  target_user: 목록에서 후보를 좁힌 뒤 채택 여부를 판단하려는 개발자
  industry: Content(코드·설명 판독) + Trust(포트폴리오 신뢰감) 절충 — 목록 페이지의 Data+Emotion 절충과는 다른 축
  design_style: Minimalism
  layout_pattern: Storytelling에 가까운 순차 스크롤(Hero-like 헤더 → 프리뷰 → 소개 → 기능/기술 → 코드) — Bento Grid 아님
  color_direction: Content 방향 — 뉴트럴 컬러, 배경/텍스트 대비는 가독성 우선. 코드 블록만 예외적으로 별도 대비 규칙 적용
  theme: light # 기본 노출, 다크도 항상 동등 지원
  motion_level: button-only # 캐러셀 네비게이션·탭 전환에 한정, 신규 iframe 섹션엔 모션 없음
```

---

## 디자이너 관점

### 1. industry/layout_pattern 판단

목록 페이지(`/templates`)는 "훑어보고 비교"하는 탐색 페이지라 Bento Grid + Data/Emotion 절충이었다. 상세 페이지는 성격이 다르다 — 사용자는 이미 후보를 하나로 좁힌 뒤 "이 템플릿을 실제로 쓸 만한가"를 판단하러 들어온다. 판단 축은 다음과 같다.

| 축          | 판단                                                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------ |
| 콘텐츠 성격 | 긴 설명 텍스트 + 코드 블록이 핵심 — Content 유형의 "높은 가독성" 규칙이 직접 적용                                        |
| 신뢰 형성   | 포트폴리오 열람자가 완성도를 판단하는 페이지 — 과한 장식보다 담백한 정보 제시가 신뢰를 만듦(Trust 방향과 겹침)           |
| 정보 순서   | 헤더(요약) → 시각 증거(프리뷰) → 서술(소개) → 구조화 정보(기능/기술) → 세부 증거(코드) — 점진적으로 신뢰를 쌓아가는 흐름 |

이미 구현된 헤더(배지 → 제목 → 요약 → 메타)부터 코드 뷰어까지의 순서 자체가 Storytelling의 "Visual Hero → Story → Feature Showcase" 흐름과 자연스럽게 일치하므로, `layout_pattern`을 Storytelling(순차 스크롤)로 명시한다. Bento Grid는 "카드 단위 빠른 탐색"이 목적인데 상세 페이지는 반대로 순서대로 읽는 것이 목적이라 채택하지 않는다.

**기본 테마는 목록 페이지와 동일하게 Light를 유지한다.** 같은 도메인(스타터킷)을 다루는 두 페이지가 진입 직후 테마가 급전환되면 사용자가 "다른 서비스로 이동했나" 착각할 수 있다. Content 유형의 기본 테마도 Light이므로 원칙과도 부합한다.

### 2. 기존 3개 섹션 배치 재검토 — 유지

| 섹션                     | 현재 배치            | 판단                                                                                                                                                                                   |
| ------------------------ | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 프리뷰(이미지/iframe)    | 헤더 직후, 소개 이전 | **유지.** "보는 것"이 "읽는 것"보다 먼저 와야 진입 직후 이탈을 줄인다. 코드보다 결과물을 먼저 보여주는 순서가 신뢰 형성에 유리                                                         |
| 소개                     | 프리뷰 다음          | **유지.** 시각 정보 다음에 서술로 맥락 보강 — Storytelling의 "Story" 단계와 일치                                                                                                       |
| 주요 기능/사용 기술(2단) | 소개 다음, 코드 이전 | **유지.** 나열형 정보를 나란히 배치해 스캔하기 쉽게 하고, 코드를 보기 전에 "무엇으로 만들어졌는지" 먼저 알려줌                                                                         |
| 코드                     | 최하단               | **유지.** 가장 깊은 증거(실제 구현)를 마지막에 두는 배치가 "믿을 만한 근거를 점점 더 제시"하는 흐름과 맞음. 코드 뷰어는 세로 탭이라 스크롤 공간을 크게 차지하므로 페이지 최하단이 적절 |

기존 순서를 바꿀 근거가 없다 — 재배치는 요청받지 않은 변경이므로 하지 않는다. 이번 spec의 변경 지점은 프리뷰 섹션의 **내용물**(iframe 추가)이지 **위치**가 아니다.

### 3. 라이브 프리뷰(iframe)를 기존 캐러셀 자리에 배치 — 타당함

`spec-fixed.md`가 이미 "기존 `preview_images` 캐러셀 섹션 자리를 그대로 사용"으로 확정했고, 디자인 관점에서도 이 결정은 타당하다.

- 두 프리뷰 방식(정적 캐러셀 vs 라이브 iframe)은 "이 템플릿이 실제로 어떻게 보이는가"라는 **동일한 사용자 질문**에 답한다. 같은 질문에 답하는 콘텐츠가 페이지 내 두 곳에 흩어지면 사용자가 "또 다른 프리뷰가 있나?"라고 헷갈린다.
- `TemplatePreviewSection`(PRD 결정 1)이 우선순위 분기(iframe → 캐러셀 → 숨김)를 전담하므로, 시각적으로도 "이 자리는 항상 프리뷰 하나만 보여준다"는 위계가 유지된다.
- 대안으로 "iframe을 코드 섹션 옆/위에 별도 신설"하는 안은 배제한다. 코드를 보기 전에 이미 캐러셀 자리에서 결과물을 봤는데 하단에 또 프리뷰가 나오면 페이지 리듬(요약 → 증거 → 서술 → 세부)이 두 번 반복되어 늘어진 인상을 준다.

### 4. iframe 크기/비율/테두리/배경 처리

| 항목                  | 결정                                   | 근거                                                                                                                                                                                                                                                              |
| --------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 컨테이너              | 기존 `mx-auto max-w-3xl`을 그대로 유지 | `PreviewImageCarousel`과 동일한 폭 제약을 물려받아야 프리뷰 섹션이 iframe이든 캐러셀이든 페이지 좌우 리듬이 흔들리지 않음                                                                                                                                         |
| 비율                  | `aspect-video`(16:9) 유지              | `PreviewImageCarousel`이 이미 `aspect-video`를 쓰고 있어 컴포넌트 전환 시 레이아웃 시프트가 없음. 웹페이지 프리뷰는 세로로 긴 콘텐츠가 많지만, 상세 페이지는 "전체 화면 재현"이 아니라 "느낌을 보여주는 미리보기"이므로 스크롤 가능한 16:9 창으로 충분            |
| 테두리                | `rounded-lg border border-border`      | 캐러셀 이미지는 `rounded-lg`만 쓰고 테두리가 없는데, iframe은 내부 콘텐츠의 배경색이 페이지 배경과 다를 수 있어(예: 어두운 템플릿) 경계가 흐려질 위험이 있다. `border`로 프리뷰 영역의 경계를 명확히 해 "여기까지가 임베드된 외부 콘텐츠"임을 시각적으로 구분한다 |
| 배경(로드 전/공백 시) | `bg-muted`                             | iframe이 로드되기 전이나 `X-Frame-Options`로 빈 화면이 될 때, 배경이 투명이면 페이지 배경과 구분이 안 돼 "깨진 화면"처럼 보인다. `bg-muted`를 깔아두면 최소한 "여기 프리뷰 영역이 있다"는 형태는 유지된다                                                         |
| 그림자/장식           | 없음                                   | [visual-style.md](../../design/visual-style.md) Minimalism 원칙 — 카드도 아니고 별도 elevation을 줄 이유가 없다. 목록 페이지 카드의 hover elevation과 달리 iframe은 상호작용 대상이 아니라 콘텐츠 표시 영역이므로 정적으로 둔다                                   |

### 5. "새 창에서 열기" 링크 배치

**텍스트 링크(아이콘 병행) 채택, Primary 버튼 배제.**

| 대안                                                   | 배제/채택 이유                                                                                                                                                                                                                                                                                                        |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Primary 버튼                                           | 이 페이지의 유일한 Primary Action은 관리자 전용 "수정"이거나, 일반 사용자에게는 딱히 없다. iframe 옆에 큰 버튼을 두면 [component.md](../../design/component.md)의 "Primary는 하나"라는 원칙과 충돌할 소지가 생기고, "새 창 열기"는 프리뷰를 못 볼 때 쓰는 **보조 수단**이지 페이지의 핵심 목적이 아니므로 과한 강조다 |
| 텍스트 링크 + 외부 링크 아이콘(`ExternalLink`, lucide) | 채택. 목록 페이지의 "이전/다음" 아이콘 버튼(`ChevronLeft/Right`, secondary icon 버튼)과 유사한 보조 내비게이션 위계. 아이콘은 "새 창에서 열림"을 시각적으로 예고해 클릭 전에 기대를 명확히 함                                                                                                                         |
| 배치 위치                                              | iframe 컨테이너 바로 아래, 우측 정렬 텍스트 링크                                                                                                                                                                                                                                                                      | spec이 "iframe 옆/위"로 명시. 상단에 겹쳐 올리면(overlay) iframe 내부 콘텐츠와 시각적으로 충돌할 수 있어(z-index 경쟁, 클릭 오작동 위험) **컨테이너 바로 아래, 우측 정렬**을 택한다. 캐러셀의 좌우 네비게이션 버튼은 항상 안전한 이미지(자체 콘텐츠) 위에 오버레이되지만, iframe은 외부 페이지라 클릭 가능 영역이 겹치면 사용자가 어느 페이지를 조작하는지 혼란스럽다 |
| 캐러셀에도 동일 링크 필요한가                          | 아니오                                                                                                                                                                                                                                                                                                                | spec 범위는 iframe 전용("iframe이 차단되어 빈 화면으로 보이는 경우" 대비). 정적 이미지 캐러셀은 로드 실패 개념이 다르고(`FallbackImage`가 이미 처리) 새 창에서 열 대상 URL도 없다                                                                                                                                                                                     |

### 6. preview_url·preview_images 둘 다 없을 때 — 완전히 숨김이 타당함

spec-fixed 시나리오 3번대로 섹션(헤더 `<h2 className="sr-only">미리보기</h2>` 포함)을 통째로 렌더링하지 않는 것이 레이아웃 리듬을 깨지 않는다.

- 현재 코드도 이미 `starterKit.preview_images.length > 0 && (...)` 조건으로 섹션 자체를 조건부 렌더링하고 있어, 빈 섹션이나 빈 placeholder 박스가 소개 섹션 위에 남는 사례가 없다. `TemplatePreviewSection`도 동일하게 "null 반환 시 아무 마진도 남기지 않기" 원칙을 지켜야 한다(`<section className="mb-10">`으로 감싸므로, 내용이 없으면 `section` 자체를 렌더링하지 않아야 `mb-10`의 빈 여백이 생기지 않는다).
- 대안으로 "빈 상태 placeholder(예: '프리뷰가 없습니다' 안내 박스)"를 넣는 안도 검토했으나 배제한다 — 목록 페이지의 빈 상태(검색 결과 0건)는 "사용자가 액션(필터/검색)을 했는데 결과가 없다"는 피드백이 필요한 맥락이지만, 상세 페이지의 프리뷰 부재는 사용자 액션과 무관한 데이터 상태이므로 안내가 없어도 혼란을 주지 않는다.
- 헤더(요약) 다음 섹션이 프리뷰 유무와 무관하게 항상 "소개"로 자연스럽게 이어지므로, 프리뷰 섹션 유무가 페이지의 나머지 리듬(소개 → 기능/기술 → 코드)에 영향을 주지 않는다.

---

## 웹접근성 전문가 관점

공통 규칙([accessibility.md](../../design/accessibility.md))은 그대로 적용하며, 아래는 이번 재검토(라이브 프리뷰 iframe, 새 창 링크)에서만 발생하는 결정사항이다.

### 1. iframe의 접근 가능한 이름(`title`)

**필수로 부여한다.** `<iframe title={`${starterKit.title} 라이브 프리뷰`}>` 형태로, 캐러셀의 `alt` 문구("{title} 미리보기 이미지 N/M")와 대칭되는 패턴을 그대로 따른다.

- `title` 속성 생략: HTML 스펙상 선택이지만, 스크린리더는 `iframe`을 만나면 `title`을 읽어 "이 프레임이 무엇인지"를 사용자에게 미리 알린다. 생략하면 스크린리더는 embed된 문서의 `<title>` 태그를 대신 읽는데, `preview_url`은 외부 배포 사이트라 그 문서의 `<title>`이 이 프로젝트 맥락과 무관하거나(예: "localhost:3000", 빈 문자열) 아예 없을 수 있어 신뢰할 수 없다. 기각.
- `aria-label`을 iframe에 병행 부여: `title`이 이미 iframe의 접근 가능한 이름 계산에서 최우선으로 채택되므로 추가해도 실질적 이득이 없고, 두 속성이 다른 문구로 어긋날 경우 유지보수 부담만 생긴다. `title` 하나로 통일한다.

### 2. iframe 내부 콘텐츠와 Tab 순서

iframe 내부는 별도 브라우징 컨텍스트(별도 문서)이므로, Tab 키는 페이지의 자연스러운 순서를 그대로 따르되 iframe에 진입한 뒤에는 내부 문서의 포커스 가능 요소들을 순회하고, 그 문서를 벗어날 때 다시 상위 문서의 다음 요소로 돌아온다. 이는 브라우저 네이티브 동작이라 별도 구현이 필요 없다.

- iframe에 `tabIndex={-1}`을 줘서 Tab 순서에서 완전히 제외하는 방안은 배제한다. `preview_url`로 배포된 템플릿 자체가 키보드로 조작 가능한 완성된 페이지일 수 있는데(예: 폼이 있는 랜딩), `tabIndex={-1}`은 컨테이너 자체를 스킵할 뿐 내부 상호작용까지 막지는 못해 혼란만 더한다.
- `sandbox="allow-scripts allow-same-origin allow-forms"`(아래 프론트엔드 관점 §2 참조)에 `allow-popups` 등을 넣지 않는 한, 내부 문서가 새 창을 강제로 띄우거나 포커스를 탈취하는 경로는 최소 권한 원칙으로 이미 차단된다 — 보안 결정이지만 포커스 탈취 방지라는 접근성 효과도 함께 얻는다.

### 3. 로드 성공/실패를 감지 못하는 상황의 스크린리더 안내

PRD·spec-fixed 모두 "크로스오리진 제약으로 JS가 로드 성공/실패를 감지할 수 없고, 별도 에러 UI를 만들지 않는다"고 이미 확정했다. 접근성 관점에서 할 수 있는 것은 "지금 무엇을 보고 있는지"를 감지가 아니라 **사전 고지**로 대체하는 것이다.

- `role="status" aria-live="polite"`로 로딩 상태를 안내하는 방안(목록 페이지 무한스크롤의 live region과 유사)은 배제한다. iframe은 로드 완료 이벤트를 신뢰할 수 없어(`onLoad`가 실패 시에도 발동하거나 아예 발동하지 않는 브라우저별 편차 존재) live region에 채울 정확한 문구 자체가 없다. 거짓 정보를 읽어주는 것이 아예 안내하지 않는 것보다 나쁘다.
- **채택**: iframe 바로 위/옆에 상시 노출되는 시각적 안내 텍스트(예: "아래는 실제 배포된 페이지입니다. 화면이 보이지 않으면 새 창에서 열기를 이용하세요")를 DOM 순서상 iframe보다 먼저 배치해, 스크린리더 사용자가 iframe에 도달하기 전에 맥락을 먼저 듣게 한다. "감지해서 알리기"가 아니라 "감지 불가능하다는 전제 위에서 항상 유효한 대안 경로(새 창 링크)를 먼저 각인시키기"이므로 PRD의 Out of Scope(에러 감지 기능 미구현)와 충돌하지 않는다. 시각 텍스트로 두어 저시력 사용자에게도 동일하게 유효하다.

### 4. "새 창에서 열기" 링크의 접근 가능한 이름과 사전 고지

`aria-label={`${starterKit.title} 새 탭에서 열기`}`처럼 대상(어떤 템플릿의 프리뷰인지)까지 포함한다. "새 창에서 열기"라는 텍스트 자체가 이미 목적을 설명하므로, 별도의 `sr-only` "(새 탭에서 열림)" 접미사는 **중복이라 추가하지 않는다** — 목록 페이지 design.md가 "중복 알림 방지"를 원칙으로 삼은 것과 동일한 논리다.

`target="_blank"`에는 `rel="noopener noreferrer"`를 함께 부여한다(`noopener`가 없으면 새로 열린 탭이 원본 탭의 `window.opener`를 통해 조작 가능해지는 문제가 있어 사용자 컨텍스트 보호에도 기여한다).

### 5. 프리뷰 섹션 부재 시 heading 레벨 연속성

`preview_url`과 `preview_images`가 모두 없으면 섹션 자체(헤더 포함)가 렌더링되지 않는다. 현재 구조는 `h1`(제목) 다음 첫 `h2`가 프리뷰 섹션(`sr-only`)이고 그다음이 "소개" `h2`다. 프리뷰 섹션이 사라져도 "소개"가 곧바로 `h2`로 이어지므로 **h1 → h2로 레벨을 건너뛰지 않는다.** `TemplatePreviewSection` 내부에 `h3` 등 별도 heading을 추가하지 않고, 상위에서 내려주는 `h2` 하나만 유지하도록 구현 시 주의가 필요하다.

### 6. 기존 컴포넌트 재검증

- **캐러셀(`preview-image-carousel.tsx`)**: `alt`에 순서 정보(N/M) 포함, 좌우 버튼에 `aria-hidden` 아이콘 + `sr-only` 텍스트 병행 — 기존 그대로 유지, 문제 없음.
- **코드 뷰어 세로 탭(`starter-kit-code-viewer.tsx`, `vertical-tabs.tsx`)**: `orientation="vertical"`을 Base UI Root에 명시적으로 전달해 키보드 방향과 시각 방향을 일치시킨 자체 래퍼가 이미 있음 — 기존 그대로 유지, 문제 없음.
- **상세페이지 진입 시 포커스 관리**: `starter-kit-detail-heading.tsx`가 이미 `<h1 tabIndex={-1}>` + 마운트 시 `focus()`를 구현하고 있어, 목록 페이지 design.md에서 정의한 계약이 실제 구현에 그대로 반영되어 있음을 확인했다. 이번 라이브 프리뷰 추가로 이 계약을 변경할 필요는 없다.

---

## 프론트엔드 개발자 관점

### 1. `TemplatePreviewSection` 컴포넌트 인터페이스

PRD 결정 1(우선순위 분기 전담 컴포넌트 신설)을 그대로 따른다. `page.tsx`가 이미 조회해둔 `starterKit`에서 필요한 값만 뽑아 넘기고, 우선순위 판단(`preview_url` → `preview_images` → 숨김)은 전부 컴포넌트 내부로 밀어 넣는다.

```ts
// src/features/starter-kit/ui/template-preview-section.tsx
interface TemplatePreviewSectionProps {
  previewUrl?: string;
  images: string[];
  title: string;
}

export function TemplatePreviewSection({ previewUrl, images, title }: TemplatePreviewSectionProps) {
  if (previewUrl) {
    return (
      <section className="mb-10">
        <h2 className="sr-only">미리보기</h2>
        <div className="mx-auto max-w-3xl space-y-2">
          <iframe
            src={previewUrl}
            title={`${title} 라이브 프리뷰`}
            sandbox="allow-scripts allow-same-origin allow-forms"
            className="aspect-video w-full rounded-lg border border-border bg-muted"
          />
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${title} 새 탭에서 열기`}
            className="block text-right text-sm text-muted-foreground underline underline-offset-2"
          >
            새 창에서 열기
          </a>
        </div>
      </section>
    );
  }

  if (images.length > 0) {
    return (
      <section className="mb-10">
        <h2 className="sr-only">미리보기</h2>
        <div className="mx-auto max-w-3xl">
          <PreviewImageCarousel images={images} title={title} />
        </div>
      </section>
    );
  }

  return null;
}
```

`page.tsx`의 변경분은 다음 한 줄 교체로 끝난다.

```diff
- {starterKit.preview_images.length > 0 && (
-   <section className="mb-10">
-     <h2 className="sr-only">미리보기</h2>
-     <div className="mx-auto max-w-3xl">
-       <PreviewImageCarousel images={starterKit.preview_images} title={starterKit.title} />
-     </div>
-   </section>
- )}
+ <TemplatePreviewSection
+   previewUrl={starterKit.preview_url}
+   images={starterKit.preview_images}
+   title={starterKit.title}
+ />
```

### 2. iframe `sandbox` 속성 근거

| 값                             | 포함 여부    | 근거                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------ | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `allow-scripts`                | 포함         | 배포된 템플릿은 실제 동작하는 React 앱이므로 JS 실행이 없으면 빈 화면만 보인다.                                                                                                                                                                                                                                                                             |
| `allow-same-origin`            | 포함         | iframe 콘텐츠가 자신의 origin에서 로드한 리소스(API 호출, 로컬 스토리지 등)를 정상적으로 쓰려면 필요하다. `allow-scripts` + `allow-same-origin`을 동시에 주면 iframe이 `sandbox` 속성 자체를 우회할 수 있다는 알려진 제약이 있으나, 프리뷰 대상은 관리자가 직접 등록하는 신뢰 가능한 자기 배포 템플릿이지 임의 사용자 입력이 아니므로 허용 범위로 판단한다. |
| `allow-forms`                  | 포함         | 로그인/문의 폼 등을 담은 템플릿의 폼 제출 동작까지 보여주려면 필요하다.                                                                                                                                                                                                                                                                                     |
| `allow-popups`                 | 제외         | "새 창에서 열기" 링크가 별도 대체 경로로 항상 존재하므로 불필요하다.                                                                                                                                                                                                                                                                                        |
| `allow-top-navigation`         | 제외         | iframe 내부 링크 클릭으로 상세 페이지 전체가 다른 사이트로 이동해버리는 것은 원치 않는 동작이다.                                                                                                                                                                                                                                                            |
| `referrerpolicy="no-referrer"` | 구현 시 검토 | 상세 페이지 URL이 프리뷰 대상 사이트로 새어나가지 않게 한다. spec 확정 범위 밖이지만 추가 여부만 검토.                                                                                                                                                                                                                                                      |

`spec-fixed.md`가 "정확한 속성 조합은 구현 단계에서 실제 배포 템플릿 동작을 보며 조정"이라 명시했으므로, 위 3개(`allow-scripts allow-same-origin allow-forms`)를 기본값으로 시작하고 실제 배포 템플릿에서 깨지는 동작이 있으면 추가한다. 선제적으로 `allow-modals` 등을 넣지 않는다(YAGNI).

### 3. 서버/클라이언트 경계

`TemplatePreviewSection` 자체는 **`'use client'`가 필요 없다.** iframe은 순수 HTML 엘리먼트이고, 우선순위 분기는 props 값을 보는 조건문일 뿐 `useState`/이벤트 핸들러가 없다 — 서버 컴포넌트로 두면 클라이언트 번들에 아무것도 추가되지 않는다.

| 컴포넌트                       | 서버/클라이언트                | 이유                                       |
| ------------------------------ | ------------------------------ | ------------------------------------------ |
| `page.tsx`                     | 서버 (기존 유지)               | 데이터 fetch(`getStarterKitById`)만 담당   |
| `template-preview-section.tsx` | 서버 (신규)                    | `useState`/이벤트 핸들러 없음, 분기 로직뿐 |
| `preview-image-carousel.tsx`   | 클라이언트 (기존 유지, 무수정) | 캐러셀 인덱스 `useState`                   |

`preview_images` 분기에서 `PreviewImageCarousel`을 호출하는 것은 "서버 컴포넌트가 클라이언트 컴포넌트를 자식으로 렌더링"하는 표준 패턴이라 문제없다 — `preview-image-carousel.tsx` 최상단의 `'use client'`가 이미 그 경계를 긋고 있다.

### 4. `preview_url` 검증 스키마

`schema.ts`에 기존 `imagePathSchema` 바로 아래 별도 스키마로 추가한다. `imagePathSchema`는 `/`(내부 경로) 또는 `http(s)://`를 모두 허용하지만, `preview_url`은 "항상 외부 배포 URL"이므로 내부 경로 허용 브랜치가 없다 — 이름이 비슷해도 재사용하면 검증 의도가 흐려지므로 새로 정의한다.

```ts
/**
 * 라이브 프리뷰 URL: http(s)로 시작하는 외부 배포 URL만 허용한다.
 * javascript:/data: 등 위험 스킴을 차단하고, 로컬 개발 서버 테스트를
 * 지원하기 위해 https 강제는 하지 않는다.
 */
const previewUrlSchema = z
  .string()
  .trim()
  .refine((value) => value === '' || /^https?:\/\//.test(value), 'http(s):// URL이어야 합니다');
```

`preview_images`와 달리 콤마 구분 문자열 변환 대상이 아니다 — 단일 텍스트 입력이므로 `to-create-input.ts`/`to-form-values.ts`에서 값을 그대로 통과시키면 된다.

```ts
// to-create-input.ts
preview_url: values.preview_url.trim() || undefined,

// to-form-values.ts
preview_url: starterKit.preview_url ?? '',
```

### 5. 타입 안정성 — optional 필드와 폼 문자열의 불일치

| 계층                                         | 타입                    | 빈 값 표현                    |
| -------------------------------------------- | ----------------------- | ----------------------------- |
| `StarterKit.preview_url` (도메인)            | `string \| undefined`   | 필드 자체가 없음(`undefined`) |
| `TemplateFormValues.preview_url` (폼)        | `string`(optional 아님) | 빈 문자열 `''`                |
| `CreateTemplateInput.preview_url` (BFF 전송) | `string \| undefined`   | `undefined`                   |

폼 레이어는 `useAppForm`이 `ZodType<T, T>`를 요구해 `.optional()`을 걸면 값이 `string | undefined`가 되어 RHF 입력 바인딩이 번거로워진다 — `preview_images`가 이미 겪은 문제와 동일한 성격이라 같은 해법을 적용한다: **폼 스키마에서는 `z.string()`(빈 문자열 허용)으로 두고, 도메인/BFF 경계(`to-create-input.ts`)에서만 빈 문자열을 `undefined`로 접는다.** `templateFormSchema` 내 다른 선택 필드(`preview_images`)도 동일한 규칙이므로 여기서만 `.optional()`을 쓰면 폼 안에서 두 가지 규칙이 혼재해 변환 함수 양쪽에 분기가 하나씩 더 늘어난다. 기존 패턴과의 일관성을 우선한다.

---

## 종합 — 세 관점 교차 확인

- **프리뷰 컨테이너 시각 처리(디자이너 §4 `border`/`bg-muted`) ↔ 로드 실패 시 스크린리더 대응(접근성 §3 사전 고지 텍스트)**: 둘 다 "iframe이 차단되어 빈 화면일 수 있다"는 동일한 전제에서 나온 결정이다. 시각적으로는 `bg-muted`로 빈 영역도 "여기 프리뷰가 있다"는 형태를 유지하고, 스크린리더 사용자에게는 텍스트로 같은 사실을 사전 고지한다 — `template-preview-section.tsx` 하나의 컴포넌트 안에서 두 처리가 함께 렌더링되어야 한다.
- **"새 창에서 열기" 배치(디자이너 §5 컨테이너 아래 우측 정렬) ↔ 접근 가능한 이름(접근성 §4 `aria-label`) ↔ 구현(개발자 §1 코드 스니펫)**: 세 관점이 동일한 링크 하나에 각각 시각 위치, 스크린리더 텍스트, `rel="noopener noreferrer"` 보안 속성을 요구한다 — 위 코드 스니펫의 `<a>` 태그가 이 세 요구를 모두 충족하도록 한 번에 구현해야 한다.
- **`sandbox` 속성(개발자 §2 보안 최소 권한) ↔ 포커스 탈취 방지(접근성 §2)**: `allow-popups`/`allow-top-navigation`을 제외한 결정은 개발자 관점에서는 보안(임의 배포 콘텐츠의 과도한 권한 차단) 근거로, 접근성 관점에서는 포커스 탈취 방지 효과로 각각 정당화된다 — 하나의 `sandbox` 값으로 두 목적을 동시에 달성하므로 별도 조율 없이 그대로 채택한다.
- **레이아웃 리듬 유지(디자이너 §6 완전 숨김) ↔ heading 레벨 연속성(접근성 §5)**: `TemplatePreviewSection`이 `null`을 반환할 때 `section`/`h2` 래퍼째로 사라져야 한다는 요구가 두 관점에서 동일하게 도출된다 — 디자이너는 빈 여백(`mb-10`) 방지, 접근성은 heading 레벨 스킵 방지가 이유지만 구현(개발자 §1)의 `return null;` 한 줄이 두 요구를 함께 만족한다.
