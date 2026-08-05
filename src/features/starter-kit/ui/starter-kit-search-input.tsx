'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebouncedValue } from '@/shared/lib/hooks/use-debounced-value';

const SEARCH_DEBOUNCE_MS = 300;

interface StarterKitSearchInputProps {
  initialQuery: string;
}

/**
 * 제목/태그 실시간 검색 입력.
 * 타이핑 중에는 로컬 상태만 갱신하고, 300ms 동안 입력이 없으면
 * URL 쿼리스트링(`?q=`)에 반영합니다(디바운스).
 *
 * 현재 이 도메인(starter-kit)에서만 사용 중이라 쿼리 파라미터명(`q`),
 * aria-label, placeholder, 디바운스 지연(300ms)을 하드코딩했습니다.
 * 다른 도메인에서 동일한 "로컬 즉시 반영 + URL 디바운스 반영" 검색 UI가
 * 필요해지면(2회 규칙), 그때 파라미터명/라벨/지연시간을 props로 빼서
 * `shared/ui`로 승격을 검토하세요. 디바운스 로직 자체는 이미
 * `shared/lib/hooks/use-debounced-value.ts`에 범용 훅으로 분리되어 있습니다.
 */
export function StarterKitSearchInput({ initialQuery }: StarterKitSearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    const currentQuery = searchParams.toString();
    const params = new URLSearchParams(currentQuery);
    const trimmedQuery = debouncedQuery.trim();

    if (trimmedQuery === '') {
      params.delete('q');
    } else {
      params.set('q', trimmedQuery);
    }

    const nextQuery = params.toString();

    if (nextQuery !== currentQuery) {
      const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
      router.replace(nextUrl, { scroll: false });
    }
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
        placeholder="제목 또는 태그로 검색"
        aria-label="스타터 킷 검색"
        className="pl-8"
      />
    </div>
  );
}
