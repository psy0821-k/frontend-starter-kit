import { notFound } from 'next/navigation';
import { requireAdmin } from '@/shared/api/auth/require-admin';
import { getStarterKitById } from '@/features/starter-kit/api/get-starter-kit-by-id';
import { toTemplateFormValues } from '@/features/starter-kit/lib/to-form-values';
import { TemplateEditForm } from '@/features/starter-kit/ui/template-edit-form';

interface TemplateEditPageProps {
  params: Promise<{ id: string }>;
}

/**
 * 템플릿 수정 페이지 (관리자 전용).
 *
 * 권한이 없거나 대상 템플릿이 없을 때 모두 404로 통일한다 — 403이나 별도
 * 분기는 "이 id의 템플릿이 존재한다/존재하지 않는다"를 누설하며, 이는
 * template-register-form의 관리자 가드와 동일한 원칙이다.
 */
export default async function TemplateEditPage({ params }: TemplateEditPageProps) {
  try {
    await requireAdmin();
  } catch {
    notFound();
  }

  const { id } = await params;
  const starterKit = await getStarterKitById(id);

  if (starterKit === null) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">템플릿 수정</h1>
        <p className="text-muted-foreground">
          템플릿 정보와 구성 파일을 수정합니다. 파일 목록은 저장 시 전체가 교체됩니다.
        </p>
      </header>

      <TemplateEditForm
        templateId={starterKit.id}
        defaultValues={toTemplateFormValues(starterKit)}
      />
    </main>
  );
}
