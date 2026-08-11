import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Feature } from '../model/types';

interface FeatureCardProps {
  feature: Feature;
}

/**
 * Feature 목록 카드. 클릭 동작이 없는 정보 표시 전용 카드입니다
 * (상세 페이지 없음 — spec-fixed.md §6 참고).
 */
export function FeatureCard({ feature }: FeatureCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{feature.title}</CardTitle>
        <CardDescription>{feature.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Badge variant="secondary">{feature.category}</Badge>
      </CardContent>
    </Card>
  );
}
