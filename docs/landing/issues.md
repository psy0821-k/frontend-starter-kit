# 랜딩페이지 이슈 목록

PRD([prd.md](./prd.md)) "디자인 규칙 적용 > 검증 결과" 섹션에서 미검증/위반 가능성으로 표시된 4개 항목을 이슈로 분할한다. 핵심 기능(카드 목록·요약 모달)은 이미 구현 완료 상태이므로, 여기서는 검증·보정 작업만 다룬다.

의존성: 이슈 간 순차 의존은 없다(각각 독립적인 화면 요소를 검증/보정). 단, 이슈 1(다크모드 검증)에서 대비 문제가 발견되면 이슈 2(대비 검증)와 결과가 합쳐질 수 있어 이슈 1을 먼저 진행한다.

---

## 이슈 1: 랜딩페이지 다크모드 실제 렌더링 검증 및 보정

**배경**: `globals.css`에 `.dark` 클래스 기반 다크 토큰이 정의되어 있고 `next-themes`가 `attribute="class"`로 연결되어 있으나, 랜딩페이지(카드 목록·요약 모달·빈 상태)를 다크 테마로 실제 렌더링해 검증한 기록이 없다. `docs/design/color.md`는 "다크는 라이트를 단순 반전한 값이 아니라 별도로 검증"을 요구한다.

**작업 범위**

- `<html>`에 `.dark` 클래스를 적용한 상태로 `/` 페이지, 요약 모달, 빈 상태 UI를 렌더링해 확인한다.
- 카드 썸네일 placeholder(`FallbackImage`), Badge, 카테고리 텍스트 등이 다크 배경에서 시인성을 유지하는지 확인한다.
- 문제 발견 시 `globals.css`의 `.dark` 토큰 값만 보정한다(컴포넌트 구조 변경 없음).

**Out of Scope**: 다크모드 토글 UI(버튼) 자체 구현 — PRD Out of Scope와 동일하게 이번 이슈에서 다루지 않는다.

**Acceptance Criteria**

- [x] Given `.dark` 클래스가 적용된 상태, When 랜딩페이지에 접속하면, Then 모든 텍스트가 배경과 시각적으로 구분되어 읽힌다(카드 제목/설명/태그/날짜 포함). — 브라우저 실렌더링으로 확인, 별도 보정 불필요
- [x] Given `.dark` 클래스가 적용된 상태, When 요약 모달을 연다면, Then 모달 배경·텍스트·버튼이 라이트 모드와 동일한 정보 위계로 구분되어 보인다. — 브라우저 실렌더링으로 확인
- [x] Given `.dark` 클래스가 적용된 상태, When 스타터 킷이 0개인 빈 상태를 본다면, Then 빈 상태 아이콘과 텍스트가 배경과 구분되어 보인다. — 다크 토큰(`muted-foreground` 6.91:1)이 라이트보다 오히려 대비가 높아 문제 없음으로 판단

---

## 이슈 2: 카드 텍스트 요소 색상 대비(WCAG AA) 검증 및 보정

**배경**: `docs/design/accessibility.md`는 본문 대비 4.5:1 이상, 큰 텍스트·UI 요소 3:1 이상을 요구한다. `starter-kit-card.tsx`의 `text-muted-foreground`(업데이트 날짜), Badge의 `outline`/`secondary` variant가 라이트·다크 각 테마에서 이 기준을 충족하는지 코드만으로는 확인되지 않았다.

**작업 범위**

- 라이트 테마에서 카드의 `CardTitle`, `CardDescription`, 업데이트 날짜(`text-xs text-muted-foreground`), Badge 텍스트의 실제 대비 비율을 측정한다(브라우저 접근성 검사 도구 또는 대비 계산기 사용).
- 다크 테마에서 동일 요소를 측정한다(이슈 1과 함께 진행 가능).
- 기준 미달 요소가 있으면 해당 토큰 값만 조정한다.

**Acceptance Criteria**

- [x] Given 라이트 테마, When 카드의 제목·설명·날짜·Badge 텍스트를 측정하면, Then 모두 4.5:1 이상이다. — OKLCH→sRGB 변환 실측: 최저값 `muted-foreground` 4.73:1, 나머지 14:1 이상
- [x] Given 다크 테마, When 동일 요소를 측정하면, Then 모두 4.5:1 이상이다. — 최저값 `muted-foreground` 6.91:1, 나머지 14:1 이상
- [x] Given 대비 기준 미달 요소가 발견된 경우, When 토큰 값을 보정하면, Then 재측정 시 4.5:1 이상을 만족한다. — 기준 미달 요소 없어 보정 불필요

---

## 이슈 3: 카드 업데이트 날짜 텍스트 크기를 접근성 기준(16px 이상)에 맞게 조정

**배경**: `docs/design/accessibility.md`는 "작은 텍스트(본문 16px 미만) 금지"를 명시한다. `starter-kit-card.tsx`의 업데이트 날짜가 `text-xs`(12px)로 렌더링되어 이 기준을 위반한다. 단, 날짜는 "본문"이 아니라 보조 메타데이터 성격이라 예외 적용 여부를 먼저 판단해야 한다.

**작업 범위**

- `docs/design/accessibility.md` 기준의 "본문" 범위에 카드 메타데이터(날짜)가 포함되는지 판단 근거를 PRD 검증 섹션에 기록한다.
- 포함된다고 판단하면 `text-xs`를 `text-sm`(14px, Dashboard 라벨 허용치) 또는 `text-base`(16px)로 조정한다 — `docs/design/typography.md`의 "14px 허용(라벨)" 예외 조항 적용 여부를 함께 판단한다.
- 조정 시 카드 레이아웃(높이 일관성)이 깨지지 않는지 확인한다.

**Acceptance Criteria**

- [x] Given 카드 목록이 렌더링된 상태, When 업데이트 날짜 텍스트 크기를 확인하면, Then `docs/design/typography.md`/`accessibility.md` 기준에 부합하는 크기(라벨 예외 적용 시 14px 이상, 미적용 시 16px 이상)로 표시된다. — 카드 메타데이터를 라벨로 분류해 `text-xs`(12px)→`text-sm`(14px)로 조정
- [x] Given 텍스트 크기가 조정된 상태, When 카드 그리드를 모바일/태블릿/데스크톱 3단계에서 확인하면, Then 카드 높이 일관성이 유지된다. — 독립된 한 줄(`time` 요소)이라 레이아웃 영향 없음, 브라우저로 확인

---

## 이슈 4: 카드·모달 타이포그래피(본문 크기·line-height) 기준 대비 검증

**배경**: `docs/design/typography.md`는 Content 유형 페이지에 본문 16px 이상, line-height 1.6 이상을 요구한다. 현재 `CardDescription`, 모달의 `DialogDescription`은 shadcn 기본값(`text-sm`, 14px)을 그대로 사용하고 있어 기준과의 정합성이 확인되지 않았다.

**작업 범위**

- `CardDescription`(카드 한 줄 설명), `DialogDescription`(모달 소개), 모달 내 "주요 기능" 리스트 텍스트의 실제 font-size·line-height 값을 확인한다.
- Content 유형 기준(16px 이상, line-height 1.6 이상)과 대조해 차이가 있으면, 카드처럼 압축 정보가 필요한 요소는 예외 허용 범위를 PRD에 근거와 함께 기록하고, 모달 본문처럼 실제 읽기 목적이 강한 요소는 기준에 맞게 조정한다.

**Acceptance Criteria**

- [x] Given 카드와 모달의 텍스트 요소별 font-size/line-height를 측정한 상태, When `docs/design/typography.md` 기준과 대조하면, Then 각 요소가 기준 충족/예외(근거 포함) 중 하나로 명확히 분류된다. — 분류 결과는 prd.md "디자인 규칙 대비 검증 결과" 참조
- [x] Given 예외 없이 기준 미달로 분류된 요소가 있는 경우, When 값을 조정하면, Then 모달 레이아웃이 깨지지 않고 재측정 시 기준을 충족한다. — `DialogDescription`, "주요 기능" 리스트를 `text-base leading-relaxed`로 조정, 브라우저로 레이아웃 확인

---

## GATE 확인 사항

- [ ] 각 이슈가 수직 슬라이스인가(완료 시 관찰 가능한 화면 변화 또는 검증 결과가 있는가) — 4개 모두 "검증 → 필요 시 보정"으로 완결되는 단위임을 확인
- [ ] AC가 사용자 관찰 가능한 결과로 끝나는가 — 측정값/렌더링 결과 기준으로 작성됨
- [ ] 의존성 순서 — 이슈 1을 먼저 진행 권장(다크모드 렌더링 확보 후 이슈 2의 다크 테마 측정 가능), 이슈 3·4는 독립적으로 병행 가능
