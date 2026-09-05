import { STARTERS } from './starters';
import type { Starter } from './types';

/** slug로 카탈로그 항목을 찾는 순수 함수. 없으면 undefined를 반환합니다. */
export function getStarterBySlug(slug: string): Starter | undefined {
  return STARTERS.find((starter) => starter.slug === slug);
}
