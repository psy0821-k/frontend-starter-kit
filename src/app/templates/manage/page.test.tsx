// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import TemplateManagePage from './page';
import { createMockStarterKit } from '@/features/starter-kit/model/test-fixtures';

const requireAdmin = vi.fn();
const getStarterKits = vi.fn();
const notFound = vi.fn();

vi.mock('@/shared/api/auth/require-admin', () => ({
  requireAdmin: (...args: unknown[]) => requireAdmin(...args),
}));

vi.mock('@/features/starter-kit/api/get-starter-kits', () => ({
  getStarterKits: (...args: unknown[]) => getStarterKits(...args),
}));

vi.mock('next/navigation', () => ({
  notFound: (...args: unknown[]) => notFound(...args),
}));

vi.mock('@/features/starter-kit/ui/delete-template-dialog', () => ({
  DeleteTemplateDialog: ({
    templateId,
    templateTitle,
  }: {
    templateId: string;
    templateTitle: string;
  }) => <div data-testid={`delete-dialog-${templateId}`} data-title={templateTitle} />,
}));

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe('TemplateManagePage', () => {
  it('should render a table with title/category/created/updated columns when an admin user visits the page', async () => {
    requireAdmin.mockResolvedValue({ id: 'admin-1' });
    getStarterKits.mockResolvedValue([
      createMockStarterKit({
        id: 'kit-1',
        title: 'ERP 대시보드',
        category: 'erp',
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-05T00:00:00.000Z',
      }),
    ]);

    const element = await TemplateManagePage();
    render(element);

    expect(screen.getByText('ERP 대시보드')).toBeInTheDocument();
    expect(screen.getByText('erp')).toBeInTheDocument();
    expect(screen.getByText('2026.01.01')).toBeInTheDocument();
    expect(screen.getByText('2026.01.05')).toBeInTheDocument();
  });

  it('should render an edit link pointing to /templates/[id]/edit for each row', async () => {
    requireAdmin.mockResolvedValue({ id: 'admin-1' });
    getStarterKits.mockResolvedValue([createMockStarterKit({ id: 'kit-1', title: '템플릿 A' })]);

    const element = await TemplateManagePage();
    render(element);

    const editLink = screen.getByRole('link', { name: '수정' });
    expect(editLink).toHaveAttribute('href', '/templates/kit-1/edit');
  });

  it('should render a delete action reusing DeleteTemplateDialog for each row', async () => {
    requireAdmin.mockResolvedValue({ id: 'admin-1' });
    getStarterKits.mockResolvedValue([createMockStarterKit({ id: 'kit-1', title: '템플릿 A' })]);

    const element = await TemplateManagePage();
    render(element);

    expect(screen.getByTestId('delete-dialog-kit-1')).toHaveAttribute('data-title', '템플릿 A');
  });

  it('should call notFound when requireAdmin rejects (non-admin or unauthenticated user)', async () => {
    requireAdmin.mockRejectedValue(new Error('not admin'));
    getStarterKits.mockResolvedValue([]);

    await TemplateManagePage();

    expect(notFound).toHaveBeenCalled();
  });

  it('should render an empty-state row spanning all columns when there are no templates', async () => {
    requireAdmin.mockResolvedValue({ id: 'admin-1' });
    getStarterKits.mockResolvedValue([]);

    const element = await TemplateManagePage();
    render(element);

    const cell = screen.getByRole('cell');
    expect(cell).toHaveAttribute('colspan', '5');
  });

  it('should sort templates by updated_at descending when multiple templates exist', async () => {
    requireAdmin.mockResolvedValue({ id: 'admin-1' });
    getStarterKits.mockResolvedValue([
      createMockStarterKit({
        id: 'kit-older',
        title: '오래된 템플릿',
        updated_at: '2026-01-01T00:00:00.000Z',
      }),
      createMockStarterKit({
        id: 'kit-newer',
        title: '최신 템플릿',
        updated_at: '2026-02-01T00:00:00.000Z',
      }),
    ]);

    const element = await TemplateManagePage();
    render(element);

    const rowHeaders = screen.getAllByRole('row').slice(1); // 첫 행은 헤더
    const rowTexts = rowHeaders.map((row) => row.textContent ?? '');

    expect(rowTexts[0]).toContain('최신 템플릿');
    expect(rowTexts[1]).toContain('오래된 템플릿');
  });
});
