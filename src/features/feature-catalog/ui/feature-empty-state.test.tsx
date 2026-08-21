// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { FeatureEmptyState } from './feature-empty-state';

afterEach(() => {
  cleanup();
});

describe('FeatureEmptyState', () => {
  it('컴포넌트가 렌더링될 때 "등록된 Feature가 없습니다" 문구를 표시해야 한다', () => {
    render(<FeatureEmptyState />);

    expect(screen.getByText('등록된 Feature가 없습니다')).toBeInTheDocument();
  });
});
