# Visual Style Rules

[← index](./index.md)

| 스타일        | 사용                                           | 규칙                                                      |
| ------------- | ---------------------------------------------- | --------------------------------------------------------- |
| Minimalism    | Professional Service, Portfolio, Documentation | 많은 여백, 낮은 장식성, Typography 중심                   |
| Motion Driven | Brand Experience, Creative Landing             | 아래 Duration 표 준수, `prefers-reduced-motion` 필수 대응 |

**Glassmorphism / Liquid Glass는 채택하지 않습니다.** Blur·반투명 레이어는 배경에 따라 대비가 계속 달라져 색 대비를 코드로 검증할 수 없고, [accessibility.md](./accessibility.md)의 색상 대비 기준과 충돌합니다. Premium/AI 톤이 필요하면 미묘한 그라디언트나 elevation(그림자)으로 대체합니다.

## Motion Duration

| 목적                     | Duration |
| ------------------------ | -------- |
| Button / Hover           | 120ms    |
| Component Transition     | 200ms    |
| Premium / 강조 Animation | 400ms    |

모든 애니메이션은 `prefers-reduced-motion: reduce`에서 즉시 완료 상태로 대체합니다. hover에만 존재하는 정보·액션은 금지 — 키보드 포커스에서도 동일하게 노출합니다.
