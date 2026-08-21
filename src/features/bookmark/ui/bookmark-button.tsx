'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Bookmark } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useBookmark } from '../model/use-bookmark';
import type { BookmarkState, BookmarkTarget } from '../model/types';

interface BookmarkButtonProps {
  target: BookmarkTarget;
  initialData?: BookmarkState;
  isAuthenticated: boolean;
  className?: string;
}

export function BookmarkButton({
  target,
  initialData,
  isAuthenticated,
  className,
}: BookmarkButtonProps) {
  const router = useRouter();
  const { isBookmarked, count, toggle } = useBookmark(target, initialData, {
    onError: () => {
      toast.error('북마크 처리에 실패했습니다. 잠시 후 다시 시도해주세요.');
    },
  });

  const handleClick = () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    toggle();
  };

  return (
    <button
      type="button"
      aria-pressed={isBookmarked}
      aria-label={isBookmarked ? '북마크 해제' : '북마크 추가'}
      onClick={handleClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-sm transition-colors hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        isBookmarked && 'bg-accent text-accent-foreground',
        className
      )}
    >
      <Bookmark className={cn('size-4', isBookmarked && 'fill-current')} aria-hidden="true" />
      <span>{count}</span>
    </button>
  );
}
