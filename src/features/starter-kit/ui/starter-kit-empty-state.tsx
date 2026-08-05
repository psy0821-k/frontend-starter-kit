import { PackageOpen } from 'lucide-react';

/**
 * 등록된 스타터 킷이 하나도 없을 때 보여주는 전역 빈 상태 UI.
 */
export function StarterKitEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <PackageOpen className="size-10 text-muted-foreground" aria-hidden="true" />
      <p className="text-base font-medium">등록된 스타터 킷이 없습니다</p>
      <p className="text-sm text-muted-foreground">잠시 후 다시 확인해주세요.</p>
    </div>
  );
}
