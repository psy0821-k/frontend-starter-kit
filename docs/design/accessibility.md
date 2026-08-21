# Accessibility Rules

[← index](./index.md)

모든 페이지의 기본 조건입니다. 예외 없음.

**필수**

- WCAG AA: 본문 대비 4.5:1 이상, 큰 텍스트·UI 요소 3:1 이상
- Keyboard Navigation 전체 지원, Focus State 시각적으로 표시
- Semantic HTML 사용

**금지**

- 색상만으로 상태 표현(아이콘/텍스트/형태 중 최소 1개 병행)
- 작은 텍스트(본문 16px 미만)
- 숨겨진 Interactive Element(hover 전용 액션)

## 실측 기록

`/templates` 카테고리 필터 칩의 텍스트/배경 대비를 Playwright E2E
(`src/app/templates/templates-list.e2e.ts`)로 실제 렌더링된 `getComputedStyle` 색상값을
읽어 `src/shared/lib/contrast-ratio.ts`의 `getContrastRatio`로 계산했다. 측정 일자:
2026-08-19.

| 컴포넌트         | 테마   | 상태   | 텍스트 색상(RGB)   | 배경 색상(RGB)     | 대비 비율 | 기준(4.5:1) 충족 |
| ---------------- | ------ | ------ | ------------------ | ------------------ | --------- | ---------------- |
| 카테고리 필터 칩 | 라이트 | 선택   | rgb(250, 250, 250) | rgb(23, 23, 23)    | 17.18:1   | 충족             |
| 카테고리 필터 칩 | 라이트 | 비선택 | rgb(10, 10, 10)    | rgb(255, 255, 255) | 19.80:1   | 충족             |
| 카테고리 필터 칩 | 다크   | 선택   | rgb(23, 23, 23)    | rgb(229, 229, 229) | 14.23:1   | 충족             |
| 카테고리 필터 칩 | 다크   | 비선택 | rgb(250, 250, 250) | rgb(4, 4, 4)       | 19.64:1   | 충족             |

측정 방법: Playwright E2E가 `/templates` 페이지의 카테고리 필터 칩 요소에서
`getComputedStyle`로 실제 렌더링된 `color`/`backgroundColor`를 읽고,
`getContrastRatio`(WCAG 상대 휘도 공식)로 대비 비율을 계산한다. 위 표의 값은 이
계산 로직을 임시 로깅으로 1회 확인한 결과이며, 회귀 여부는
`templates-list.e2e.ts`의 대비 검증 테스트 4건이 지속적으로 보증한다.
