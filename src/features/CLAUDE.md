# src/features — 도메인 수직 슬라이스

각 도메인(order, product, auth 등)은 독립적인 폴더로 관리됩니다. 기능이 커질수록 이 구조로 확장합니다.

## 폴더 구조 (예: order)

```
src/features/order/
├─ api/              # 쿼리/뮤테이션 훅 (TanStack Query)
│  └─ queries.ts
├─ model/            # Zod 스키마, 타입 정의
│  ├─ schema.ts
│  └─ types.ts
├─ ui/               # 도메인 컴포넌트
│  ├─ order-list.tsx
│  └─ order-form.tsx
└─ CLAUDE.md         # 도메인별 규칙 및 용어
```

## 의존 규칙

- `features/order` → `features/order` 내부만 import
- `features/order` → `shared` import 허용
- `features/order` ↔ `features/product` 직접 import 금지
  - 대신 `app/` 또는 상위 컨테이너에서 조합

## AI와 협업할 때

- 도메인 폴더의 CLAUDE.md에 "이 도메인의 용어", "비즈니스 규칙", "반복되는 패턴"을 명시
- 예: `order`의 상태(pending/confirmed/shipped/delivered)를 일관되게 표현하도록 가이드
