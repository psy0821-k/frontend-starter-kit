// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FeatureList } from './feature-list';
import { createMockFeature } from '../model/test-fixtures';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('FeatureList', () => {
  it('Feature 카드를 선택하면 /features/{id}로 이동해야 한다', async () => {
    const user = userEvent.setup();
    const features = [createMockFeature({ id: 'feature-1', title: '검색' })];
    render(<FeatureList features={features} />);

    await user.click(screen.getByRole('button', { name: /검색/ }));

    expect(push).toHaveBeenCalledWith('/features/feature-1');
  });
});
