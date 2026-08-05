interface TemplateDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * 스타터 킷 상세 페이지 placeholder.
 * 요약 모달의 '자세히 보기' 이동 대상이며, 실제 상세 UI는 별도 작업으로 구현합니다.
 */
export default async function TemplateDetailPage({ params }: TemplateDetailPageProps) {
  const { id } = await params;

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="mb-2 text-2xl font-bold">스타터 킷 상세 페이지</h1>
      <p className="text-muted-foreground">id: {id}</p>
      <p className="mt-4 text-sm text-muted-foreground">상세 페이지는 준비 중입니다.</p>
    </main>
  );
}
