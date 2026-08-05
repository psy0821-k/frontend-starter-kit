# Design System Guide

## Purpose

이 문서는 프로젝트에서 생성되는 모든 웹 페이지의 디자인 방향을 결정하는 공통 기준입니다.
디자인 선택은 예쁜 UI가 아니라 서비스 목적, 사용자 신뢰, 콘텐츠 성격에 맞는 패턴 선택입니다.

페이지를 생성하거나 리뷰하기 전 이 문서를 먼저 확인한 뒤, 아래 목차에서 필요한 섹션으로 이동합니다.

---

## 목차

| 문서                                   | 내용                                                                               |
| -------------------------------------- | ---------------------------------------------------------------------------------- |
| [layout.md](./layout.md)               | Layout Pattern — Hero Landing, Bento Grid, Storytelling, Interactive Demo          |
| [visual-style.md](./visual-style.md)   | Visual Style Rules — Minimalism/Motion Driven, Glassmorphism 금지, Motion Duration |
| [color.md](./color.md)                 | Color System — 서비스 유형별 컬러 방향                                             |
| [typography.md](./typography.md)       | Typography Rules — 서체, 본문 크기, Line Height                                    |
| [accessibility.md](./accessibility.md) | Accessibility Rules — WCAG AA, 키보드 내비게이션, 금지 사항                        |
| [component.md](./component.md)         | Component Design Rules — Button, Card 등                                           |

---

## 1. Design Decision Framework

페이지 생성 전 서비스 유형을 먼저 판단합니다.

| 유형         | 예                                     | 적용                                        | 기본 테마 |
| ------------ | -------------------------------------- | ------------------------------------------- | --------- |
| Content 중심 | Blog, Docs, Education, News            | 높은 가독성, 넓은 여백, Typography 중심     | Light     |
| Data 중심    | Dashboard, Analytics, Admin            | 정보 밀도 증가, 명확한 계층 구조            | Dark      |
| Emotion 중심 | Food, Fashion, Entertainment, Social   | 강한 이미지, Interactive Motion             | Light     |
| Trust 중심   | Finance, Healthcare, Legal, Government | 안정적 컬러, Minimal Design, 과한 효과 금지 | Light     |

**다크모드는 선택이 아니라 기본값 문제입니다.** 모든 페이지는 라이트/다크 두 테마를 모두 지원하며, 위 "기본 테마"는 첫 진입 시 노출 테마일 뿐입니다.

---

## 8. Design Generation Rules

페이지 생성 시 아래 정보를 먼저 정의하고 시작합니다.

```yaml
page:
  purpose: # 페이지의 단일 목적
  target_user:
  industry: # Content / Data / Emotion / Trust 중 하나
  design_style: # Minimalism / Motion Driven
  layout_pattern: # Hero Landing / Bento Grid / Storytelling / Interactive Demo
  color_direction: # color.md 기준 방향
  theme: light | dark # 기본 노출 테마, 다른 테마도 항상 함께 구현
  motion_level: none | button-only | full # visual-style.md Duration 표 적용 범위
```

`industry`는 [1. Design Decision Framework](#1-design-decision-framework), `layout_pattern`은 [layout.md](./layout.md), `color_direction`은 [color.md](./color.md), `motion_level`은 [visual-style.md](./visual-style.md)를 참조해 값을 채웁니다.
