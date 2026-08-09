import { notFound } from 'next/navigation';
import { requireAdmin } from '@/shared/api/auth/require-admin';
import { TemplateRegisterForm } from '@/features/starter-kit/ui/template-register-form';

/**
 * 템플릿 등록 페이지 (관리자 전용).
 *
 * 이 가드는 화면 노출을 막을 뿐이며 최종 방어선이 아닙니다 — 실제 권한 통제는
 * DB의 RLS 정책이 담당합니다(anon key가 브라우저에 노출되므로 API를 우회한
 * 직접 호출을 애플리케이션 코드로는 막을 수 없습니다).
 *
 * 권한이 없을 때 403이 아니라 404를 반환하는 이유는 403이 "이 경로에 관리자
 * 페이지가 존재한다"는 사실을 누설하기 때문입니다.
 */
export default async function TemplateRegisterPage() {
  try {
    await requireAdmin();
  } catch {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">템플릿 등록</h1>
        <p className="text-muted-foreground">
          템플릿 정보와 구성 파일을 등록하면 상세 페이지에서 파일별 코드를 볼 수 있습니다.
        </p>
      </header>

      <TemplateRegisterForm />
    </main>
  );
}
