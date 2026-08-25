// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FeatureCard } from './feature-card';
import { createMockFeature } from '../model/test-fixtures';

afterEach(() => {
  cleanup();
});

const baseFeature = createMockFeature({
  id: 'feature-1',
  title: '검색',
  description: '검색 기능',
  category: 'search',
});

describe('FeatureCard', () => {
  it('카드를 클릭하면 해당 feature와 함께 onSelect를 호출해야 한다', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<FeatureCard feature={baseFeature} onSelect={onSelect} />);

    await user.click(screen.getByRole('button', { name: /검색/ }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(baseFeature);
  });

  it('포커스된 상태에서 Enter를 누르면 해당 feature와 함께 onSelect를 호출해야 한다', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<FeatureCard feature={baseFeature} onSelect={onSelect} />);

    await user.tab();
    await user.keyboard('{Enter}');

    expect(onSelect).toHaveBeenCalledWith(baseFeature);
  });

  it('포커스된 상태에서 Space를 누르면 해당 feature와 함께 onSelect를 호출해야 한다', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<FeatureCard feature={baseFeature} onSelect={onSelect} />);

    await user.tab();
    await user.keyboard(' ');

    expect(onSelect).toHaveBeenCalledWith(baseFeature);
  });

  it('button 요소로 렌더링되고 focus-visible 스타일을 가져야 한다', () => {
    render(<FeatureCard feature={baseFeature} onSelect={vi.fn()} />);

    const button = screen.getByRole('button', { name: /검색/ });

    expect(button.tagName).toBe('BUTTON');
    expect(button.className).toContain('focus-visible:outline');
  });
});
