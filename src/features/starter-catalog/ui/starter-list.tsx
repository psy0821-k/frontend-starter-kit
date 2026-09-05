import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Starter } from '../model/types';

interface StarterListProps {
  starters: Starter[];
}

/** 스타터 카탈로그 카드 그리드. 각 카드는 `/starters/[slug]` 상세로 이동합니다. */
export function StarterList({ starters }: StarterListProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {starters.map((starter) => (
        <Link key={starter.slug} href={`/starters/${starter.slug}`} className="block">
          <Card>
            <CardHeader>
              <CardTitle>{starter.title}</CardTitle>
              <CardDescription>{starter.summary}</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">{starter.category}</Badge>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
