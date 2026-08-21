import { Skeleton } from '@/components/ui/skeleton';

/**
 * 스타터 킷 상세 페이지의 로딩 상태.
 * TemplateDetailPage와 동일한 섹션 순서로 레이아웃 시프트를 방지합니다.
 */
export default function TemplateDetailLoading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-12" />
        </div>
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-40" />
      </header>

      <section className="mb-10">
        <div className="mx-auto max-w-3xl">
          <Skeleton className="aspect-video w-full" />
        </div>
      </section>

      <section className="mb-10">
        <Skeleton className="mb-3 h-6 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-3/4" />
      </section>

      <div className="mb-10 grid gap-8 sm:grid-cols-2">
        <section>
          <Skeleton className="mb-3 h-6 w-24" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </section>
        <section>
          <Skeleton className="mb-3 h-6 w-24" />
          <div className="flex flex-wrap gap-1.5">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-14" />
            <Skeleton className="h-5 w-20" />
          </div>
        </section>
      </div>

      <section>
        <Skeleton className="mb-3 h-6 w-16" />
        <Skeleton className="h-64 w-full" />
      </section>
    </main>
  );
}
