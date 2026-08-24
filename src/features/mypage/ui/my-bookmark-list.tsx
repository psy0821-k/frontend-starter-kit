'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { ApiError } from '@/shared/api/error';
import { removeBookmark } from '@/features/bookmark/api/bookmark-client';
import type { MyBookmarkItem } from '../api/get-my-bookmarks';

export interface MyBookmarkListProps {
  items: MyBookmarkItem[];
}

const TYPE_LABELS: Record<MyBookmarkItem['targetType'], string> = {
  template: '템플릿',
  feature: '기능',
};

function itemKey(item: MyBookmarkItem): string {
  return `${item.targetType}:${item.targetId}`;
}

export function MyBookmarkList({ items: initialItems }: MyBookmarkListProps) {
  const [items, setItems] = useState(initialItems);
  const [removingKeys, setRemovingKeys] = useState<Set<string>>(new Set());

  if (items.length === 0) {
    return <p>아직 북마크한 항목이 없습니다</p>;
  }

  const handleRemove = async (item: MyBookmarkItem) => {
    const key = itemKey(item);
    setRemovingKeys((prev) => new Set(prev).add(key));

    try {
      await removeBookmark({ targetType: item.targetType, targetId: item.targetId });
      setItems((prev) => prev.filter((current) => itemKey(current) !== key));
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error('북마크 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
      setRemovingKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  return (
    <ul>
      {items.map((item) => {
        const key = itemKey(item);
        return (
          <li key={key}>
            <Badge variant="secondary">{TYPE_LABELS[item.targetType]}</Badge>
            <span>{item.title}</span>
            <button
              type="button"
              disabled={removingKeys.has(key)}
              onClick={() => handleRemove(item)}
            >
              삭제
            </button>
          </li>
        );
      })}
    </ul>
  );
}
