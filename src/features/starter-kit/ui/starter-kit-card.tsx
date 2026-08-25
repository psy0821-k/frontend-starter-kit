import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FallbackImage } from '@/shared/ui/fallback-image';
import { formatDate } from '@/shared/lib/format-date';
import { ClickableCard } from '@/shared/ui/clickable-card';
import { BookmarkButton } from '@/features/bookmark/ui/bookmark-button';
import type { StarterKit } from '../model/types';

const MAX_VISIBLE_TAGS = 3;

interface StarterKitCardProps {
  starterKit: StarterKit;
  onSelect: (starterKit: StarterKit) => void;
  /** 랜딩페이지(StarterKitSection)는 아직 북마크를 지원하지 않아 기본값 false로 둔다. */
  isBookmarked?: boolean;
  isAuthenticated?: boolean;
}

/**
 * 스타터 킷 목록 카드.
 * 내부에 BookmarkButton(버튼)을 포함하므로 button 중첩을 피하기 위해
 * ClickableCard(role="button" + tabIndex + Enter/Space 처리)로 감쌉니다.
 */
export function StarterKitCard({
  starterKit,
  onSelect,
  isBookmarked = false,
  isAuthenticated = false,
}: StarterKitCardProps) {
  const visibleTags = starterKit.tags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenTagCount = starterKit.tags.length - visibleTags.length;

  // 카드는 스캔용이라 날짜를 하나만 보여준다. 다만 라벨이 없으면 등록일인지
  // 수정일인지 알 수 없으므로, 수정된 적이 있을 때만 '수정'으로 명시한다.
  // 상세 페이지(StarterKitMetaDates)와 동일하게 날짜 단위로 비교한다.
  const formattedCreatedAt = formatDate(starterKit.created_at);
  const formattedUpdatedAt = formatDate(starterKit.updated_at);
  const isUpdated = formattedCreatedAt !== formattedUpdatedAt;

  return (
    <ClickableCard onSelect={() => onSelect(starterKit)}>
      <Card>
        <FallbackImage
          src={starterKit.thumbnail_url}
          alt={`${starterKit.title} 썸네일`}
          className="aspect-video w-full"
        />
        <CardHeader>
          <CardTitle>{starterKit.title}</CardTitle>
          <CardDescription>{starterKit.summary}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary">{starterKit.category}</Badge>
            {visibleTags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
            {hiddenTagCount > 0 && <Badge variant="outline">+{hiddenTagCount}</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">
            {isUpdated ? '수정' : '등록'}{' '}
            <time dateTime={isUpdated ? starterKit.updated_at : starterKit.created_at}>
              {isUpdated ? formattedUpdatedAt : formattedCreatedAt}
            </time>
          </p>
          <div onClick={(event) => event.stopPropagation()} className="self-start">
            <BookmarkButton
              target={{ targetType: 'template', targetId: starterKit.id }}
              initialData={{ isBookmarked, count: 0 }}
              isAuthenticated={isAuthenticated}
            />
          </div>
        </CardContent>
      </Card>
    </ClickableCard>
  );
}
