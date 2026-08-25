import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClickableCard } from '@/shared/ui/clickable-card';
import { BookmarkButton } from '@/features/bookmark/ui/bookmark-button';
import type { Feature } from '../model/types';

interface FeatureCardProps {
  feature: Feature;
  onSelect: (feature: Feature) => void;
  isBookmarked: boolean;
  isAuthenticated?: boolean;
}

/**
 * Feature 목록 카드. 클릭 또는 Enter/Space로 상세 페이지 이동을 트리거합니다
 * (StarterKitCard와 동일 구조).
 * 내부에 BookmarkButton(버튼)을 포함하므로 button 중첩을 피하기 위해
 * ClickableCard(role="button" + tabIndex + Enter/Space 처리)로 감쌉니다.
 */
export function FeatureCard({
  feature,
  onSelect,
  isBookmarked,
  isAuthenticated = false,
}: FeatureCardProps) {
  return (
    <ClickableCard onSelect={() => onSelect(feature)}>
      <Card>
        <CardHeader>
          <CardTitle>{feature.title}</CardTitle>
          <CardDescription>{feature.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Badge variant="secondary">{feature.category}</Badge>
          <div onClick={(event) => event.stopPropagation()} className="self-start">
            <BookmarkButton
              target={{ targetType: 'feature', targetId: feature.id }}
              initialData={{ isBookmarked, count: 0 }}
              isAuthenticated={isAuthenticated}
            />
          </div>
        </CardContent>
      </Card>
    </ClickableCard>
  );
}
