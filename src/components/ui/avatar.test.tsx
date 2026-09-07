// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Avatar, AvatarFallback } from './avatar';

afterEach(() => {
  cleanup();
});

describe('Avatar', () => {
  it('should display the fallback text when children text is passed to AvatarFallback', () => {
    render(
      <Avatar>
        <AvatarFallback>T</AvatarFallback>
      </Avatar>
    );

    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('should merge className with the default classes when className is passed to Avatar', () => {
    render(
      <Avatar className="custom-avatar" data-testid="avatar-root">
        <AvatarFallback>T</AvatarFallback>
      </Avatar>
    );

    const avatarRoot = screen.getByTestId('avatar-root');
    expect(avatarRoot).toHaveClass('custom-avatar');
    expect(avatarRoot).toHaveClass(
      'relative',
      'flex',
      'size-8',
      'shrink-0',
      'overflow-hidden',
      'rounded-full'
    );
  });

  it('should show AvatarFallback when AvatarImage is not used (nickname initial only)', () => {
    render(
      <Avatar>
        <AvatarFallback>T</AvatarFallback>
      </Avatar>
    );

    expect(screen.getByText('T')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
