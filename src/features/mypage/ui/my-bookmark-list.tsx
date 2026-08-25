'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardAction, CardHeader, CardTitle } from '@/components/ui/card';
import { ApiError } from '@/shared/api/error';
import { FallbackImage } from '@/shared/ui/fallback-image';
import { removeMyBookmark } from '../api/remove-my-bookmark';
import { BookmarkToggleIconButton } from './bookmark-toggle-icon-button';
import type { MyBookmarkItem } from '../api/get-my-bookmarks';

export interface MyBookmarkListProps {
  items: MyBookmarkItem[];
}

function itemKey(item: MyBookmarkItem): string {
  return `${item.targetType}:${item.targetId}`;
}

interface BookmarkItemCardProps {
  item: MyBookmarkItem;
  isRemoving: boolean;
  onRemove: (item: MyBookmarkItem) => void;
}

function BookmarkItemCard({ item, isRemoving, onRemove }: BookmarkItemCardProps) {
  return (
    <Card>
      {item.thumbnailUrl && (
        <FallbackImage
          src={item.thumbnailUrl}
          alt={`${item.title} 썸네일`}
          className="aspect-video w-full"
        />
      )}
      <CardHeader>
        <CardTitle>{item.title}</CardTitle>
        <CardAction>
          <BookmarkToggleIconButton disabled={isRemoving} onToggle={() => onRemove(item)} />
        </CardAction>
      </CardHeader>
    </Card>
  );
}

interface BookmarkSectionProps {
  title: string;
  items: MyBookmarkItem[];
  removingKeys: Set<string>;
  onRemove: (item: MyBookmarkItem) => void;
}

function BookmarkSection({ title, items, removingKeys, onRemove }: BookmarkSectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-heading text-lg font-medium">{title}</h2>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={itemKey(item)}>
            <BookmarkItemCard
              item={item}
              isRemoving={removingKeys.has(itemKey(item))}
              onRemove={onRemove}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function MyBookmarkList({ items: initialItems }: MyBookmarkListProps) {
  const [items, setItems] = useState(initialItems);
  const [removingKeys, setRemovingKeys] = useState<Set<string>>(new Set());

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">아직 북마크한 항목이 없습니다</p>;
  }

  const handleRemove = async (item: MyBookmarkItem) => {
    const key = itemKey(item);
    setRemovingKeys((prev) => new Set(prev).add(key));

    try {
      await removeMyBookmark({ targetType: item.targetType, targetId: item.targetId });
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

  const templateItems = items.filter((item) => item.targetType === 'template');
  const featureItems = items.filter((item) => item.targetType === 'feature');

  return (
    <div className="flex flex-col gap-8">
      <BookmarkSection
        title="템플릿"
        items={templateItems}
        removingKeys={removingKeys}
        onRemove={handleRemove}
      />
      <BookmarkSection
        title="기능"
        items={featureItems}
        removingKeys={removingKeys}
        onRemove={handleRemove}
      />
    </div>
  );
}
