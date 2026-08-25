'use client';

import { Bookmark } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

interface BookmarkToggleIconButtonProps {
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * 마이페이지 "내 북마크" 목록 전용 해제 버튼.
 * 상세 페이지 BookmarkButton과 동일한 시각(lucide Bookmark + fill-current)을 쓰되,
 * 목록에서는 항상 "북마크됨" 상태로 시작해 클릭 시 즉시 해제(항목 제거)하므로
 * 카운트 표시나 useBookmark 상태 관리는 필요 없어 별도 컴포넌트로 분리했다.
 */
export function BookmarkToggleIconButton({
  onToggle,
  disabled,
  className,
}: BookmarkToggleIconButtonProps) {
  return (
    <button
      type="button"
      aria-pressed="true"
      aria-label="북마크 해제"
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        'inline-flex items-center justify-center rounded-md border border-border p-1.5 text-accent-foreground transition-colors hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50',
        className
      )}
    >
      <Bookmark className="size-4 fill-current" aria-hidden="true" />
    </button>
  );
}
