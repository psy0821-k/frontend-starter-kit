// @vitest-environment jsdom
import type { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import FeatureDetailPage, { generateMetadata } from './page';
import type { FeatureDetail } from '@/features/feature-catalog/model/types';

/**
 * BookmarkButton이 useBookmark(TanStack Query)를 쓰므로, 실제 앱(layout.tsx의
 * QueryProvider)과 동일하게 QueryClientProvider로 감싸서 렌더링한다.
 */
function renderPage(page: ReactElement) {
  const queryClient = new QueryClient();
  return render(<QueryClientProvider client={queryClient}>{page}</QueryClientProvider>);
}

const getFeatureById = vi.fn();
const getCurrentUser = vi.fn();
const getBookmarkStateForServer = vi.fn();
const notFound = vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND');
});

vi.mock('@/features/feature-catalog/api/get-feature-by-id', () => ({
  getFeatureById: (...args: unknown[]) => getFeatureById(...args),
}));

vi.mock('@/shared/api/auth/get-current-user', () => ({
  getCurrentUser: (...args: unknown[]) => getCurrentUser(...args),
}));

vi.mock('@/features/bookmark/api/get-bookmark-state-for-server', () => ({
  getBookmarkStateForServer: (...args: unknown[]) => getBookmarkStateForServer(...args),
}));

vi.mock('next/navigation', () => ({
  notFound: () => notFound(),
  useRouter: () => ({ push: vi.fn() }),
}));

beforeEach(() => {
  getCurrentUser.mockResolvedValue(null);
  getBookmarkStateForServer.mockResolvedValue({ isBookmarked: false, count: 0 });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const baseFeature: FeatureDetail = {
  id: 'f-1',
  title: '검색',
  description: '검색 기능 설명',
  category: 'search',
  summary: '검색 요약',
  tags: ['search-tag'],
  tech_stack: ['Next.js'],
  usage: '사용법 안내',
  files: [],
};

describe('generateMetadata', () => {
  it('존재하는 Feature id일 때 title/description이 해당 Feature의 title/summary로 설정된 Metadata를 반환해야 한다', async () => {
    getFeatureById.mockResolvedValue(baseFeature);

    const metadata = await generateMetadata({ params: Promise.resolve({ id: 'f-1' }) });

    expect(metadata).toEqual({ title: '검색', description: '검색 요약' });
  });

  it('존재하지 않는 Feature id일 때 fallback title이 설정된 Metadata를 반환해야 한다', async () => {
    getFeatureById.mockResolvedValue(null);

    const metadata = await generateMetadata({ params: Promise.resolve({ id: 'missing' }) });

    expect(metadata).toEqual({ title: 'Feature를 찾을 수 없습니다' });
  });
});

describe('FeatureDetailPage', () => {
  it('존재하는 Feature id일 때 title/summary/description/category/tags/tech_stack/usage를 모두 화면에 표시해야 한다', async () => {
    getFeatureById.mockResolvedValue(baseFeature);

    const page = await FeatureDetailPage({ params: Promise.resolve({ id: 'f-1' }) });
    renderPage(page);

    expect(screen.getByText('검색')).toBeInTheDocument();
    expect(screen.getByText('검색 요약')).toBeInTheDocument();
    expect(screen.getByText('검색 기능 설명')).toBeInTheDocument();
    expect(screen.getByText('search')).toBeInTheDocument();
    expect(screen.getByText('search-tag')).toBeInTheDocument();
    expect(screen.getByText('Next.js')).toBeInTheDocument();
    expect(screen.getByText('사용법 안내')).toBeInTheDocument();
  });

  it('feature_files가 빈 배열일 때 코드 섹션을 렌더링하지 않아야 한다', async () => {
    getFeatureById.mockResolvedValue({ ...baseFeature, files: [] });

    const page = await FeatureDetailPage({ params: Promise.resolve({ id: 'f-1' }) });
    renderPage(page);

    expect(screen.queryByText('코드')).not.toBeInTheDocument();
  });

  it('feature_files가 있을 때 코드 섹션과 파일 경로를 렌더링해야 한다', async () => {
    getFeatureById.mockResolvedValue({
      ...baseFeature,
      files: [{ file_path: 'src/index.ts', code: 'export {}', language: 'ts', sort_order: 0 }],
    });

    const page = await FeatureDetailPage({ params: Promise.resolve({ id: 'f-1' }) });
    renderPage(page);

    expect(screen.getByText('코드')).toBeInTheDocument();
    expect(screen.getByText('src/index.ts')).toBeInTheDocument();
  });

  it('존재하지 않는 Feature id일 때 notFound를 호출해야 한다', async () => {
    getFeatureById.mockResolvedValue(null);

    await expect(FeatureDetailPage({ params: Promise.resolve({ id: 'missing' }) })).rejects.toThrow(
      'NEXT_NOT_FOUND'
    );
    expect(notFound).toHaveBeenCalled();
  });

  it('로그인 상태이고 아직 북마크하지 않았을 때 북마크 버튼이 미북마크 상태로 렌더링되어야 한다', async () => {
    getFeatureById.mockResolvedValue(baseFeature);
    getCurrentUser.mockResolvedValue({ id: 'user-1' });
    getBookmarkStateForServer.mockResolvedValue({ isBookmarked: false, count: 0 });

    const page = await FeatureDetailPage({ params: Promise.resolve({ id: 'f-1' }) });
    renderPage(page);

    const button = screen.getByRole('button', { name: '북마크 추가' });
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('로그인 상태이고 이미 북마크했을 때 북마크 버튼이 북마크됨 상태로 렌더링되어야 한다', async () => {
    getFeatureById.mockResolvedValue(baseFeature);
    getCurrentUser.mockResolvedValue({ id: 'user-1' });
    getBookmarkStateForServer.mockResolvedValue({ isBookmarked: true, count: 1 });

    const page = await FeatureDetailPage({ params: Promise.resolve({ id: 'f-1' }) });
    renderPage(page);

    const button = screen.getByRole('button', { name: '북마크 해제' });
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('비로그인 상태일 때 북마크 버튼이 렌더링되어야 한다', async () => {
    getFeatureById.mockResolvedValue(baseFeature);
    getCurrentUser.mockResolvedValue(null);

    const page = await FeatureDetailPage({ params: Promise.resolve({ id: 'f-1' }) });
    renderPage(page);

    expect(screen.getByRole('button', { name: '북마크 추가' })).toBeInTheDocument();
    expect(getBookmarkStateForServer).toHaveBeenCalledWith(
      { targetType: 'feature', targetId: 'f-1' },
      null
    );
  });
});
