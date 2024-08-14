import { generateUser } from '@repo/lib';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import { describe, expect, test, vi } from 'vitest';

import AccountSettings from '@/components/navigation/account-settings';

vi.mock('next-auth/react', () => {
  const session: Session = {
    user: {
      ...generateUser({
        name: 'John Doe',
      }),
      cookies: ['laravel_session', 'XSRF-TOKEN'],
    },
    expires: '',
  };

  return {
    signOut: vi.fn(),
    useSession: vi.fn().mockReturnValue({
      data: session,
    }),
  };
});

describe('AccountSettings', () => {
  test('renders user name and ThemeSwitcher', async () => {
    render(<AccountSettings />);

    const user = userEvent.setup();

    const toggleButton = screen.getByRole('button', { name: /user/i });

    await user.click(toggleButton);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /theme switcher/i })
    ).toBeInTheDocument();
  });

  test('calls signOut on logout click', async () => {
    render(<AccountSettings />);

    const user = userEvent.setup();

    const toggleButton = screen.getByRole('button', { name: /user/i });

    await user.click(toggleButton);

    const logoutButton = screen.getByRole('menuitem', { name: /logout/i });

    await user.click(logoutButton);

    expect(signOut).toHaveBeenCalled();
  });
});
