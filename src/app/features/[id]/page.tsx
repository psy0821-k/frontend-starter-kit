import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { getFeatureById } from '@/features/feature-catalog/api/get-feature-by-id';
import { StarterKitCodeViewer } from '@/features/starter-kit/ui/starter-kit-code-viewer';
import { getCurrentUser } from '@/shared/api/auth/get-current-user';
import { getBookmarkStateForServer } from '@/features/bookmark/api/get-bookmark-state-for-server';
import { BookmarkButton } from '@/features/bookmark/ui/bookmark-button';

interface FeatureDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: FeatureDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const feature = await getFeatureById(id);

  if (feature === null) {
    return { title: 'Feature를 찾을 수 없습니다' };
  }

  return { title: feature.title, description: feature.summary };
}

/**
 * Feature 상세 페이지.
 * 요약/설명/태그/기술스택/사용법과 구성 파일 코드를 함께 보여줍니다.
 */
export default async function FeatureDetailPage({ params }: FeatureDetailPageProps) {
  const { id } = await params;
  const [feature, currentUser] = await Promise.all([getFeatureById(id), getCurrentUser()]);

  if (feature === null) {
    notFound();
  }

  const bookmarkTarget = { targetType: 'feature' as const, targetId: feature.id };
  const bookmarkState = await getBookmarkStateForServer(bookmarkTarget, currentUser?.id ?? null);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary">{feature.category}</Badge>
            {feature.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
          <BookmarkButton
            target={bookmarkTarget}
            initialData={bookmarkState}
            isAuthenticated={currentUser !== null}
          />
        </div>
        <h1 className="text-3xl font-bold">{feature.title}</h1>
        <p className="text-lg text-muted-foreground">{feature.summary}</p>
      </header>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold">소개</h2>
        <p className="leading-relaxed text-muted-foreground">{feature.description}</p>
      </section>

      <div className="mb-10 grid gap-8 sm:grid-cols-2">
        <section>
          <h2 className="mb-3 text-xl font-semibold">사용법</h2>
          <p className="leading-relaxed text-muted-foreground">{feature.usage}</p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">사용 기술</h2>
          <div className="flex flex-wrap gap-1.5">
            {feature.tech_stack.map((tech) => (
              <Badge key={tech} variant="outline">
                {tech}
              </Badge>
            ))}
          </div>
        </section>
      </div>

      {feature.files.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-semibold">코드</h2>
          <StarterKitCodeViewer files={feature.files} />
        </section>
      )}
    </main>
  );
}
