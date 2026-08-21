import { useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addBookmark, getBookmarkState, removeBookmark } from '../api/bookmark-client';
import type { BookmarkState, BookmarkTarget } from './types';

interface UseBookmarkOptions {
  /** mutation 실패 시 호출. 토스트 표시는 이 콜백을 받은 쪽(UI 레이어)의 책임. */
  onError?: () => void;
}

interface UseBookmarkResult {
  isBookmarked: boolean;
  count: number;
  isPending: boolean;
  toggle: () => void;
}

function queryKeyFor(target: BookmarkTarget) {
  return ['bookmark', target.targetType, target.targetId] as const;
}

export function useBookmark(
  target: BookmarkTarget,
  initialData?: BookmarkState,
  options?: UseBookmarkOptions
): UseBookmarkResult {
  const queryClient = useQueryClient();
  const queryKey = queryKeyFor(target);
  const isMutatingRef = useRef(false);

  const { data } = useQuery({
    queryKey,
    queryFn: () => getBookmarkState(target),
    initialData,
    staleTime: initialData ? 1000 : 0,
  });

  const mutation = useMutation({
    mutationFn: (wasBookmarked: boolean) => {
      return wasBookmarked ? removeBookmark(target) : addBookmark(target);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<BookmarkState>(queryKey);

      if (previous) {
        queryClient.setQueryData<BookmarkState>(queryKey, {
          isBookmarked: !previous.isBookmarked,
          count: previous.isBookmarked ? previous.count - 1 : previous.count + 1,
        });
      }

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      options?.onError?.();
    },
    onSettled: () => {
      isMutatingRef.current = false;
      void queryClient.invalidateQueries({ queryKey });
    },
  });

  const state = data ?? { isBookmarked: false, count: 0 };

  return {
    isBookmarked: state.isBookmarked,
    count: state.count,
    isPending: mutation.isPending,
    toggle: () => {
      if (isMutatingRef.current) {
        return;
      }
      isMutatingRef.current = true;
      mutation.mutate(state.isBookmarked);
    },
  };
}
