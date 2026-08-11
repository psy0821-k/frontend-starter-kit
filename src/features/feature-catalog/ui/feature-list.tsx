import type { Feature } from '../model/types';
import { FeatureCard } from './feature-card';

interface FeatureListProps {
  features: Feature[];
}

/** Feature 카드 그리드. */
export function FeatureList({ features }: FeatureListProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((feature) => (
        <FeatureCard key={feature.id} feature={feature} />
      ))}
    </div>
  );
}
