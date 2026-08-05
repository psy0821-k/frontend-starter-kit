import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FallbackImage } from '@/shared/ui/fallback-image';
import { formatDate } from '@/shared/lib/format-date';
import type { StarterKit } from '../model/types';

const MAX_VISIBLE_TAGS = 3;

interface StarterKitCardProps {
  starterKit: StarterKit;
  onSelect: (starterKit: StarterKit) => void;
}

/**
 * 스타터 킷 목록 카드.
 * button 요소로 렌더링해 Tab 포커스, Enter/Space 선택을 브라우저 기본 동작으로 지원합니다.
 */
export function StarterKitCard({ starterKit, onSelect }: StarterKitCardProps) {
  const visibleTags = starterKit.tags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenTagCount = starterKit.tags.length - visibleTags.length;

  return (
    <button
      type="button"
      onClick={() => onSelect(starterKit)}
      className="block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
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
          <time dateTime={starterKit.updated_at} className="text-xs text-muted-foreground">
            {formatDate(starterKit.updated_at)}
          </time>
        </CardContent>
      </Card>
    </button>
  );
}
