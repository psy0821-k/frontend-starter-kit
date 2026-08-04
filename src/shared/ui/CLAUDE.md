# src/shared/ui — 얇은 래퍼 컴포넌트

shadcn/ui를 기반으로 프로젝트의 정책을 주입한 재사용 컴포넌트입니다.

## 래퍼 생성 기준 (중요)

✅ **만들어야 할 때**: 추가 동작이나 정책 주입이 있을 때
- Button: 로딩 중 자동 disable + 스피너 표시
- FormField: 라벨, 에러 메시지, aria 속성 자동 연결
- AsyncBoundary: loading/error/empty 3가지 상태 통합

❌ **만들지 말아야 할 때**: 단순 재export
```tsx
// 안티패턴 — 이 파일은 삭제 대상
export { Input } from '@/components/ui/input';
```

래퍼 코드가 원본보다 길어지면 **과추상화 신호** → 재검토 필요

## shadcn/ui 원본 위치

shadcn 원본 컴포넌트는 `src/components/ui/`에 있습니다. **직접 수정하지 마세요** — 대신 `shared/ui/`에서 래핑해서 커스터마이징합니다.

## CVA(Class Variance Authority)

variant/size API는 CVA로 정의합니다:
```tsx
import { cva } from 'class-variance-authority';

const buttonVariants = cva('...base...', {
  variants: {
    variant: { primary: '...', secondary: '...' },
    size: { sm: '...', md: '...' },
  },
});
```

## AI와 협업할 때

1. 새 래퍼를 제안하기 전 "이게 정책 주입인가?"를 먼저 판단
2. 래퍼의 props 타입과 사용 예를 명확히 제시
3. 원본 shadcn과의 차이점을 JSDoc으로 문서화
