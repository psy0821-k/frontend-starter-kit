// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { StarterKitFilteredEmptyState } from './starter-kit-filtered-empty-state';

afterEach(() => {
  cleanup();
});

describe('StarterKitFilteredEmptyState', () => {
  it('필터 결과가 없을 때 안내 문구를 표시한다', () => {
    render(<StarterKitFilteredEmptyState />);

    expect(screen.getByText('조건에 맞는 스타터 킷이 없습니다')).toBeInTheDocument();
  });
});
