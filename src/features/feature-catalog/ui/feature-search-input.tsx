'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebouncedValue } from '@/shared/lib/hooks/use-debounced-value';

const SEARCH_DEBOUNCE_MS = 300;

interface FeatureSearchInputProps {
  initialQuery: string;
}

/**
 * 이름/설명 실시간 검색 입력.
 * 타이핑 중에는 로컬 상태만 갱신하고, 300ms 동안 입력이 없으면
 * URL 쿼리스트링(`?q=`)에 반영합니다(디바운스). 검색어 변경 시 페이지네이션은
 * 1페이지로 리셋됩니다(`?page` 제거).
 *
 * `StarterKitSearchInput`과 동일한 패턴이며, 도메인마다 파라미터명/라벨이 달라
 * 아직 공용화하지 않았습니다(2회 규칙 관찰 대상).
 */
export function FeatureSearchInput({ initialQuery }: FeatureSearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    const trimmedQuery = debouncedQuery.trim();
    const currentUrlQuery = (searchParams.get('q') ?? '').trim();

    if (trimmedQuery === currentUrlQuery) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());

    if (trimmedQuery === '') {
      params.delete('q');
    } else {
      params.set('q', trimmedQuery);
    }
    params.delete('page');

    const nextQuery = params.toString();
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }, [debouncedQuery, pathname, router, searchParams]);

  return (
    <div className="relative w-full sm:max-w-xs">
      <SearchIcon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="이름 또는 설명으로 검색"
        aria-label="Feature 검색"
        className="pl-8"
      />
    </div>
  );
}
