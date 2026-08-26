// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import Home, { metadata } from './page';

afterEach(() => {
  cleanup();
});

describe('Home', () => {
  it('LandingPage의 텍스트 설명이 화면에 보여야 한다', async () => {
    render(await Home());

    expect(screen.getByText('Frontend Starter Platform')).toBeInTheDocument();
  });

  it('기존 스타터킷 카테고리별 목록(StarterKitList)이 더 이상 렌더링되지 않아야 한다', async () => {
    render(await Home());

    expect(screen.queryByText('전체 스타터 킷')).not.toBeInTheDocument();
    expect(screen.queryByText(/카테고리별로 확인/)).not.toBeInTheDocument();
  });
});

describe('metadata', () => {
  it("title이 'Frontend Starter Platform'이어야 한다", () => {
    expect(metadata.title).toBe('Frontend Starter Platform');
  });

  it('description이 비어있지 않은 문자열이어야 한다', () => {
    expect(typeof metadata.description).toBe('string');
    expect((metadata.description as string).length).toBeGreaterThan(0);
  });

  it('openGraph.images에 OG 이미지 경로가 포함되어야 한다', () => {
    expect(metadata.openGraph?.images).toContain('/og-image.png');
  });

  it('openGraph.title/description이 기본 title/description과 일치해야 한다', () => {
    expect(metadata.openGraph?.title).toBe(metadata.title);
    expect(metadata.openGraph?.description).toBe(metadata.description);
  });
});
