import { notFound } from 'next/navigation';
import { getStarterBySlug } from '@/features/starter-catalog/model/get-starter-by-slug';
import { PortfolioLandingPage } from '@/features/portfolio-landing/ui/portfolio-landing-page';
import DashboardPage from '@/features/sales-crm-dashboard/ui/dashboard-page';

interface StarterDetailPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * 스타터 상세 페이지.
 * slug에 따라 실제 데모 컴포넌트를 렌더링합니다. 카탈로그에 없는 slug는 404 처리합니다.
 */
export default async function StarterDetailPage({ params }: StarterDetailPageProps) {
  const { slug } = await params;
  const starter = getStarterBySlug(slug);

  if (starter === undefined) {
    notFound();
  }

  if (slug === 'portfolio') {
    return <PortfolioLandingPage />;
  }

  if (slug === 'erp') {
    return <DashboardPage />;
  }

  notFound();
}
