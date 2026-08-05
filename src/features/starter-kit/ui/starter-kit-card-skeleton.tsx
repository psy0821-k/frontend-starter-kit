import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * StarterKitCard와 동일한 레이아웃의 로딩 스켈레톤.
 * 무한스크롤 추가 로딩 중 레이아웃 시프트를 방지하기 위해 사용합니다.
 */
export function StarterKitCardSkeleton() {
  return (
    <Card aria-hidden="true">
      <Skeleton className="aspect-video w-full rounded-none" />
      <CardHeader>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-12" />
        </div>
        <Skeleton className="h-4 w-20" />
      </CardContent>
    </Card>
  );
}
