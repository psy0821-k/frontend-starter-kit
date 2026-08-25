import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Feature } from '../model/types';

interface FeatureCardProps {
  feature: Feature;
  onSelect: (feature: Feature) => void;
}

/**
 * Feature 목록 카드. 클릭 또는 Enter/Space로 상세 페이지 이동을 트리거합니다
 * (StarterKitCard와 동일 구조).
 */
export function FeatureCard({ feature, onSelect }: FeatureCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(feature)}
      className="block w-full cursor-pointer text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <Card>
        <CardHeader>
          <CardTitle>{feature.title}</CardTitle>
          <CardDescription>{feature.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary">{feature.category}</Badge>
        </CardContent>
      </Card>
    </button>
  );
}
