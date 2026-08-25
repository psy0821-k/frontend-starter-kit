// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import FeatureDetailPage, { generateMetadata } from './page';
import type { FeatureDetail } from '@/features/feature-catalog/model/types';

const getFeatureById = vi.fn();
const notFound = vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND');
});

vi.mock('@/features/feature-catalog/api/get-feature-by-id', () => ({
  getFeatureById: (...args: unknown[]) => getFeatureById(...args),
}));

vi.mock('next/navigation', () => ({
  notFound: () => notFound(),
}));

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
    render(page);

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
    render(page);

    expect(screen.queryByText('코드')).not.toBeInTheDocument();
  });

  it('feature_files가 있을 때 코드 섹션과 파일 경로를 렌더링해야 한다', async () => {
    getFeatureById.mockResolvedValue({
      ...baseFeature,
      files: [{ file_path: 'src/index.ts', code: 'export {}', language: 'ts', sort_order: 0 }],
    });

    const page = await FeatureDetailPage({ params: Promise.resolve({ id: 'f-1' }) });
    render(page);

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
});
