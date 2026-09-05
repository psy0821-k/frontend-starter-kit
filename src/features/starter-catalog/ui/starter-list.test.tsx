// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { StarterList } from './starter-list';
import { STARTERS } from '../model/starters';

afterEach(() => {
  cleanup();
});

describe('StarterList', () => {
  it('카탈로그의 모든 스타터를 제목·한줄요약과 함께 카드로 렌더링한다', () => {
    render(<StarterList starters={STARTERS} />);

    STARTERS.forEach((starter) => {
      expect(screen.getByText(starter.title)).toBeInTheDocument();
      expect(screen.getByText(starter.summary)).toBeInTheDocument();
    });
  });

  it('포트폴리오 스타터 카드의 바로가기 링크는 /starters/portfolio를 가리킨다', () => {
    render(<StarterList starters={STARTERS} />);

    const portfolio = STARTERS.find((starter) => starter.slug === 'portfolio');
    expect(portfolio).toBeDefined();
    const link = screen.getByRole('link', { name: new RegExp(portfolio?.title ?? '') });

    expect(link).toHaveAttribute('href', '/starters/portfolio');
  });

  it('ERP 스타터 카드의 바로가기 링크는 /starters/erp를 가리킨다', () => {
    render(<StarterList starters={STARTERS} />);

    const erp = STARTERS.find((starter) => starter.slug === 'erp');
    expect(erp).toBeDefined();
    const link = screen.getByRole('link', { name: new RegExp(erp?.title ?? '') });

    expect(link).toHaveAttribute('href', '/starters/erp');
  });
});
