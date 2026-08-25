import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Feature를 찾을 수 없습니다',
};

/**
 * Feature 상세 페이지 전용 404.
 * 빌트인 not-found는 title을 "404: This page could not be found."로 고정해
 * generateMetadata의 fallback title을 덮어쓰므로, 이 라우트 전용으로 분리했다.
 */
export default function FeatureNotFound() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-24 text-center sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold">Feature를 찾을 수 없습니다</h1>
      <p className="text-muted-foreground">요청하신 Feature가 존재하지 않거나 삭제되었습니다.</p>
    </main>
  );
}
