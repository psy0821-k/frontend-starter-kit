'use client';

import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';
import { cn } from '@/shared/lib/cn';

type VerticalTabsProps = Omit<TabsPrimitive.Root.Props, 'orientation'>;

/**
 * 세로 방향 탭의 Root.
 *
 * shadcn의 `components/ui/tabs.tsx`는 `orientation`을 구조분해로 꺼내
 * `data-orientation` 속성으로만 사용하고 Base UI Root에는 전달하지 않습니다.
 * 그래서 그 컴포넌트에 `orientation="vertical"`을 넘기면 **CSS는 세로로 배치되지만
 * 키보드는 가로 모드로 동작**합니다 — 위/아래 화살표가 무반응이고 좌/우로만
 * 이동해 시각적 방향과 어긋납니다(WCAG 2.1.1 저해).
 *
 * 원본 수정 금지 규칙에 따라, 여기서 primitive를 직접 감싸 누락된 정책
 * (키보드 방향 = 화면 방향)을 주입합니다. `data-orientation`은 shadcn의
 * TabsList/TabsTrigger가 세로 스타일을 적용할 때 참조하므로 함께 유지합니다.
 *
 * 하위 요소(TabsList/TabsTrigger/TabsContent)는 shadcn 것을 그대로 씁니다 —
 * 그쪽은 orientation을 전달할 필요가 없어 문제가 없습니다.
 */
export function VerticalTabs({ className, ...props }: VerticalTabsProps) {
  return (
    <TabsPrimitive.Root
      orientation="vertical"
      data-slot="tabs"
      data-orientation="vertical"
      className={cn('group/tabs flex gap-2', className)}
      {...props}
    />
  );
}
