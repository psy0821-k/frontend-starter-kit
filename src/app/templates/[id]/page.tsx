import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { requireAdmin } from '@/shared/api/auth/require-admin';
import { getStarterKitById } from '@/features/starter-kit/api/get-starter-kit-by-id';
import { DeleteTemplateDialog } from '@/features/starter-kit/ui/delete-template-dialog';
import { PreviewImageCarousel } from '@/features/starter-kit/ui/preview-image-carousel';
import { StarterKitCodeViewer } from '@/features/starter-kit/ui/starter-kit-code-viewer';
import { StarterKitDetailHeading } from '@/features/starter-kit/ui/starter-kit-detail-heading';
import { StarterKitMetaDates } from '@/features/starter-kit/ui/starter-kit-meta-dates';
import { TemplateLivePreview } from '@/features/starter-kit/ui/template-live-preview';

async function checkIsAdmin(): Promise<boolean> {
  try {
    await requireAdmin();
    return true;
  } catch {
    return false;
  }
}

interface TemplateDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * 스타터 킷 상세 페이지.
 * 등록일·수정일과 함께 구성 파일별 코드를 파일 경로 단위로 제공합니다.
 */
export default async function TemplateDetailPage({ params }: TemplateDetailPageProps) {
  const { id } = await params;
  const [starterKit, isAdmin] = await Promise.all([getStarterKitById(id), checkIsAdmin()]);

  if (starterKit === null) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary">{starterKit.category}</Badge>
            {starterKit.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <Link
                href={`/templates/${starterKit.id}/edit`}
                className={buttonVariants({ variant: 'outline', size: 'sm' })}
              >
                수정
              </Link>
              <DeleteTemplateDialog templateId={starterKit.id} templateTitle={starterKit.title} />
            </div>
          )}
        </div>
        <StarterKitDetailHeading>{starterKit.title}</StarterKitDetailHeading>
        <p className="text-lg text-muted-foreground">{starterKit.summary}</p>
        <StarterKitMetaDates createdAt={starterKit.created_at} updatedAt={starterKit.updated_at} />
      </header>

      {starterKit.preview_images.length > 0 && (
        <section className="mb-10">
          <h2 className="sr-only">미리보기</h2>
          <div className="mx-auto max-w-3xl">
            <PreviewImageCarousel images={starterKit.preview_images} title={starterKit.title} />
          </div>
        </section>
      )}

      <TemplateLivePreview files={starterKit.files ?? []} />

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold">소개</h2>
        <p className="leading-relaxed text-muted-foreground">{starterKit.description}</p>
      </section>

      <div className="mb-10 grid gap-8 sm:grid-cols-2">
        <section>
          <h2 className="mb-3 text-xl font-semibold">주요 기능</h2>
          <ul className="list-inside list-disc space-y-1 leading-relaxed text-muted-foreground">
            {starterKit.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">사용 기술</h2>
          <div className="flex flex-wrap gap-1.5">
            {starterKit.tech_stack.map((tech) => (
              <Badge key={tech} variant="outline">
                {tech}
              </Badge>
            ))}
          </div>
        </section>
      </div>

      <section>
        <h2 className="mb-3 text-xl font-semibold">코드</h2>
        <StarterKitCodeViewer files={starterKit.files ?? []} />
      </section>
    </main>
  );
}
