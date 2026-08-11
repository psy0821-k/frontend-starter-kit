'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeaturePaginationProps {
  currentPage: number;
  totalPages: number;
}

/**
 * 이전/다음 + 페이지 번호 컨트롤.
 * 클릭 시 URL 쿼리스트링(`?page=`)만 갱신하고, 실제 슬라이싱은 페이지(서버 컴포넌트)가 담당합니다.
 * templates에는 선례가 없는 첫 페이지네이션 UI라 우선 이 도메인에 둡니다(2회 규칙 관찰 대상).
 */
export function FeaturePagination({ currentPage, totalPages }: FeaturePaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) {
    return null;
  }

  const navigateToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());

    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', String(page));
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <nav aria-label="페이지네이션" className="mt-8 flex items-center justify-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="이전 페이지"
        disabled={currentPage === 1}
        onClick={() => navigateToPage(currentPage - 1)}
      >
        <ChevronLeftIcon />
      </Button>
      {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
        <Button
          key={page}
          type="button"
          variant={page === currentPage ? 'default' : 'outline'}
          size="icon"
          aria-current={page === currentPage ? 'page' : undefined}
          onClick={() => navigateToPage(page)}
        >
          {page}
        </Button>
      ))}
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="다음 페이지"
        disabled={currentPage === totalPages}
        onClick={() => navigateToPage(currentPage + 1)}
      >
        <ChevronRightIcon />
      </Button>
    </nav>
  );
}
