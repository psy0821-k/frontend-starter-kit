// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { LANDING_DESCRIPTION, LandingPage } from './landing-page';

afterEach(() => {
  cleanup();
});

describe('LandingPage', () => {
  it('플랫폼을 소개하는 제목 텍스트가 화면에 보여야 한다', () => {
    render(<LandingPage />);

    expect(screen.getByText('Frontend Starter Platform')).toBeInTheDocument();
  });

  it('플랫폼을 소개하는 설명 텍스트가 문장 단위로 화면에 보여야 한다', () => {
    render(<LandingPage />);

    const sentences = LANDING_DESCRIPTION.split('.')
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence.length > 0);

    sentences.forEach((sentence) => {
      expect(screen.getByText(`${sentence}.`)).toBeInTheDocument();
    });
  });

  it('텍스트 섹션이 시맨틱 heading(h1)을 포함해야 한다', () => {
    render(<LandingPage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('모바일 뷰포트에서 텍스트 섹션이 한 컬럼 레이아웃 클래스를 가져야 한다', () => {
    render(<LandingPage />);

    const section = screen.getByTestId('landing-hero-section');
    expect(section.className).toMatch(/flex-col|grid-cols-1/);
  });
});
