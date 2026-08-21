# Issue #11 — [접근성] 카테고리 필터 칩 라이트/다크 테마 색상 대비 검증(4.5:1)

## 시그니처

### 1. 대비비 계산 순수 함수 — `src/shared/lib/contrast-ratio.ts`

`shared/lib`에는 "2회 규칙"이 적용되지만, `docs/design/accessibility.md`가 "모든 페이지의
기본 조건. 예외 없음"으로 WCAG AA 대비를 명시하고 있어 카테고리 필터 칩 이후에도 다른
shadcn 컴포넌트(Badge, Alert 등) 대비 검증에 재사용될 것이 사실상 확정적이다. 신규 도메인
전용이 아니라 "색상 대비"라는 범용 계산이므로 `shared/lib`에 둔다.

```ts
/**
 * sRGB 채널(0~255)을 WCAG 상대 휘도(relative luminance) 공식에 따라 선형화합니다.
 */
function toLinearChannel(channel: number): number;

/**
 * RGB 색상의 WCAG 상대 휘도를 계산합니다. (0~1)
 */
export function getRelativeLuminance(rgb: RgbColor): number;

/**
 * 두 RGB 색상 사이의 WCAG 대비비를 계산합니다.
 * 반환값은 1(대비 없음) ~ 21(최대 대비) 사이입니다.
 */
export function getContrastRatio(foreground: RgbColor, background: RgbColor): number;

/**
 * 텍스트 대비가 WCAG AA 기준(본문 4.5:1, 큰 텍스트/UI 요소 3:1)을 충족하는지 판별합니다.
 */
export function meetsWcagAa(ratio: number, level: 'normal-text' | 'large-text-or-ui'): boolean;
```

```ts
// src/shared/lib/contrast-ratio.ts와 함께 두는 타입
export interface RgbColor {
  r: number; // 0~255
  g: number; // 0~255
  b: number; // 0~255
}
```

에러 케이스: 없음 — 입력은 이미 `0~255` 범위의 RGB로 가정하는 순수 계산 함수이며,
호출부(E2E에서 `getComputedStyle` 파싱 결과)가 유효성을 보장한다. 런타임 값 검증까지
이 함수의 책임으로 넣는 것은 과설계(YAGNI)로 판단해 제외한다.

### 2. Playwright E2E — 실제 렌더링 색상 실측

**판단 근거**: jsdom(Vitest 유닛 테스트 환경)은 실제 브라우저 레이아웃/computed style
엔진이 없어 `getComputedStyle`이 CSS로 계산된 최종 색상값을 신뢰성 있게 반환하지 못한다.
axe-core의 `color-contrast` 룰도 공식적으로 "레이아웃 정보가 필요해 jsdom 등 비-브라우저
환경에서는 정확히 동작하지 않는다"고 알려져 있다. 반면 이 프로젝트는 이미 Playwright
E2E(`playwright.config.ts` — 실제 Chromium, `testMatch: '**/*.e2e.ts'`)를 보유하고 있으므로,
그 위에서 `page.locator(...).evaluate(el => getComputedStyle(el))`로 실제 렌더링된
`color`/`background-color`(RGB 문자열)를 추출해 `getContrastRatio`에 넣는 방식이 기존
아키텍처와 가장 잘 맞는다. vitest-axe 신규 도입은 이 이슈 범위(칩 하나의 대비값 실측·기록)에
비해 과한 인프라 신설로 판단해 채택하지 않는다(YAGNI, AC-3와도 연결).

파일 위치: `src/app/templates/templates-list.e2e.ts`에 대비 검증 테스트를 추가한다(기존
목록 페이지 E2E와 같은 파일 — 카테고리 필터 칩이 이 페이지에 렌더링되므로 새 E2E 파일을
분리하지 않는다).

```ts
// getComputedStyle 반환 문자열 "rgb(r, g, b)"를 RgbColor로 변환하는 헬퍼
// (E2E 파일 내부 지역 함수로 선언 — 재사용 필요 시에만 shared로 승격)
function parseRgbString(value: string): RgbColor;
```

## 문서 작업 항목 (AC-3, 코드 테스트 대상 아님)

AC-3("CLAUDE.md의 vitest-axe 서술을 실제 상태와 일치시킨다")는 시나리오화하지 않는다.
확인 결과 `package.json` devDependencies에 `vitest-axe`/`jest-axe`/`axe-core`가 직접
의존성으로 없다(`axe-core`는 `eslint-plugin-jsx-a11y`의 전이 종속성으로만 존재하며 런타임에
접근 불가). 이번 이슈 범위에서 vitest-axe를 신규 도입하지 않기로 했으므로(위 판단 근거),
**CLAUDE.md 서술을 실제 상태에 맞게 수정하는 쪽**을 택한다.

- 처리 시점: Red/Green 단계가 아니라 **Refactor 단계**(또는 별도 문서 수정 커밋)에서
  `CLAUDE.md`의 기술 스택 표 중 테스트 행 "Vitest(유닛) + Playwright(E2E) + vitest-axe(접근성)"을
  "Vitest(유닛) + Playwright(E2E)"로 수정하고, 접근성 검증은 "Playwright E2E에서 실제 렌더링
  색상 기반 대비비 계산(`shared/lib/contrast-ratio.ts`)으로 수행"이라는 서술을 추가한다.
- 이 문서 작업은 Red 단계의 실패 테스트 대상이 아니므로 별도 체크리스트 항목으로 관리하고,
  구현 완료 후 CLAUDE.md 수정 커밋을 별도로 남긴다.

## 테스트 시나리오

### `getRelativeLuminance`

- [정상] getRelativeLuminance — should return 1 when rgb is white (255, 255, 255)
- [정상] getRelativeLuminance — should return 0 when rgb is black (0, 0, 0)
- [경계] getRelativeLuminance — should return a value strictly between 0 and 1 when rgb is mid-gray (128, 128, 128)

### `getContrastRatio`

- [정상] getContrastRatio — should return 21 when comparing black against white
- [정상] getContrastRatio — should return 1 when foreground and background colors are identical
- [정상] getContrastRatio — should be symmetric (same ratio) when foreground/background arguments are swapped
- [경계] getContrastRatio — should return a value >= 4.5 when given the light-theme selected chip colors (primary #primary-foreground on primary, oklch(0.205 0 0) / oklch(0.985 0 0) 변환값)
- [경계] getContrastRatio — should return a value >= 4.5 when given the light-theme unselected chip colors (foreground on background)
- [경계] getContrastRatio — should return a value >= 4.5 when given the dark-theme selected chip colors (primary-foreground on primary, dark 토큰)
- [경계] getContrastRatio — should return a value >= 4.5 when given the dark-theme unselected chip colors (foreground on background, dark 토큰)

### `meetsWcagAa`

- [정상] meetsWcagAa — should return true when ratio is 4.5 and level is 'normal-text' (경계값 포함)
- [정상] meetsWcagAa — should return false when ratio is 4.49 and level is 'normal-text'
- [정상] meetsWcagAa — should return true when ratio is 3.0 and level is 'large-text-or-ui'
- [예외] meetsWcagAa — should return false when ratio is 2.99 and level is 'large-text-or-ui'

### Playwright E2E — 카테고리 필터 칩 대비 (`templates-list.e2e.ts`)

- [정상] 카테고리 필터 칩(선택) — should have a text/background contrast ratio of at least 4.5 when rendered in light theme
- [정상] 카테고리 필터 칩(비선택) — should have a text/background contrast ratio of at least 4.5 when rendered in light theme
- [정상] 카테고리 필터 칩(선택) — should have a text/background contrast ratio of at least 4.5 when rendered in dark theme
- [정상] 카테고리 필터 칩(비선택) — should have a text/background contrast ratio of at least 4.5 when rendered in dark theme

## AC 커버리지

| AC   | 내용                                                    | 커버 시나리오                                                                                                      |
| ---- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| AC-1 | 라이트 테마 선택/비선택 칩 대비 4.5:1 이상 + 문서 기록  | `getContrastRatio` 경계 시나리오 2건(라이트 선택/비선택) + E2E 정상 시나리오 2건(라이트) + 아래 "실측 기록" 문서화 |
| AC-2 | 다크 테마 선택/비선택 칩 대비 4.5:1 이상 + 문서 기록    | `getContrastRatio` 경계 시나리오 2건(다크 선택/비선택) + E2E 정상 시나리오 2건(다크) + 아래 "실측 기록" 문서화     |
| AC-3 | CLAUDE.md vitest-axe 서술과 package.json 실제 상태 일치 | 코드 테스트 대상 아님 — 위 "문서 작업 항목" 절에서 Refactor 단계 문서 수정으로 처리                                |

AC-1/2의 "그 값이 문서에 기록된다" 요건은 테스트 통과만으로 자동 충족되지 않으므로,
Green 단계에서 E2E 실측값(RGB 원본값과 계산된 대비비)을 `docs/design/accessibility.md`에
추가 기록하는 작업을 구현 체크리스트에 별도로 남긴다(이 역시 테스트 시나리오가 아니라
문서 작업이며, E2E 테스트 자체가 회귀를 계속 방지한다).

## 색상 토큰 참고 (globals.css 실측 대상)

| 테마  | 상태            | 텍스트 변수            | 배경 변수                               | 배경 클래스(button.tsx)              |
| ----- | --------------- | ---------------------- | --------------------------------------- | ------------------------------------ |
| light | 선택(default)   | `--primary-foreground` | `--primary`                             | `bg-primary text-primary-foreground` |
| light | 비선택(outline) | `--foreground`(상속)   | `--background`                          | `border-border bg-background`        |
| dark  | 선택(default)   | `--primary-foreground` | `--primary`                             | 동일 (`.dark` 토큰 재정의)           |
| dark  | 비선택(outline) | `--foreground`(상속)   | `--input`(30% 혼합, `dark:bg-input/30`) | `dark:border-input dark:bg-input/30` |

다크 테마 비선택 칩은 `dark:bg-input/30`으로 배경이 알파 블렌딩되므로, E2E에서
`getComputedStyle`로 최종 합성된 RGB를 읽어야 정확하다(CSS 변수 값을 직접 읽어 오는
방식은 alpha 합성 전 값이라 부정확할 수 있음 — 계산 근거로 `evaluate` 내부에서
`getComputedStyle(el).color` / `backgroundColor`를 사용).
