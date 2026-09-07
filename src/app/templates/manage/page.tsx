import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireAdmin } from '@/shared/api/auth/require-admin';
import { getStarterKits } from '@/features/starter-kit/api/get-starter-kits';
import { DeleteTemplateDialog } from '@/features/starter-kit/ui/delete-template-dialog';
import { formatDate } from '@/shared/lib/format-date';
import { buttonVariants } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const TABLE_COLUMN_COUNT = 5;

/**
 * 템플릿 관리 페이지 (관리자 전용).
 *
 * 이 가드는 화면 노출을 막을 뿐이며 최종 방어선이 아닙니다 — 실제 권한 통제는
 * DB의 RLS 정책이 담당합니다. 권한이 없을 때 403이 아니라 404를 반환하는
 * 이유는 templates/new/page.tsx와 동일합니다.
 */
export default async function TemplateManagePage() {
  try {
    await requireAdmin();
  } catch {
    notFound();
  }

  const templates = await getStarterKits();
  const sortedTemplates = [...templates].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">템플릿 관리</h1>
        <p className="text-muted-foreground">등록된 템플릿을 확인하고 수정·삭제할 수 있습니다.</p>
      </header>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>제목</TableHead>
            <TableHead>카테고리</TableHead>
            <TableHead>등록일</TableHead>
            <TableHead>수정일</TableHead>
            <TableHead>액션</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTemplates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={TABLE_COLUMN_COUNT} className="text-center text-muted-foreground">
                등록된 템플릿이 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            sortedTemplates.map((template) => (
              <TableRow key={template.id}>
                <TableCell>{template.title}</TableCell>
                <TableCell>{template.category}</TableCell>
                <TableCell>{formatDate(template.created_at)}</TableCell>
                <TableCell>{formatDate(template.updated_at)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/templates/${template.id}/edit`}
                      className={buttonVariants({ variant: 'outline', size: 'sm' })}
                    >
                      수정
                    </Link>
                    <DeleteTemplateDialog templateId={template.id} templateTitle={template.title} />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </main>
  );
}
