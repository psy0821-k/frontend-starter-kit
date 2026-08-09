import { formatDate } from '@/shared/lib/format-date';
import { cn } from '@/shared/lib/cn';

interface StarterKitMetaDatesProps {
  createdAt: string;
  updatedAt: string;
  className?: string;
}

/**
 * 등록일과 수정일을 함께 표시합니다.
 *
 * 두 날짜가 같은 날이면 등록일만 보여줍니다 — "등록 2026.07.20 · 수정 2026.07.20"은
 * 정보량이 0인데 시각적 잡음만 만들기 때문입니다. 비교를 초 단위가 아니라 **날짜
 * 단위**로 하는 것이 중요한데, updated_at은 DB 트리거가 갱신하므로 등록 직후에도
 * 밀리초 차이가 생길 수 있고 그걸 "수정됨"으로 표시하면 사용자에게 거짓이 됩니다.
 */
export function StarterKitMetaDates({ createdAt, updatedAt, className }: StarterKitMetaDatesProps) {
  const formattedCreatedAt = formatDate(createdAt);
  const formattedUpdatedAt = formatDate(updatedAt);
  const isUpdated = formattedCreatedAt !== formattedUpdatedAt;

  return (
    <div className={cn('flex flex-wrap items-center gap-x-2 gap-y-1 text-sm', className)}>
      <span className="text-muted-foreground">
        등록{' '}
        <time dateTime={createdAt} className="text-foreground">
          {formattedCreatedAt}
        </time>
      </span>
      {isUpdated && (
        <>
          <span aria-hidden className="text-muted-foreground">
            ·
          </span>
          <span className="text-muted-foreground">
            수정{' '}
            <time dateTime={updatedAt} className="text-foreground">
              {formattedUpdatedAt}
            </time>
          </span>
        </>
      )}
    </div>
  );
}
