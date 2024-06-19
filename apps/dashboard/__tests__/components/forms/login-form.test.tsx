import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import LoginForm from '@/components/forms/login-form';

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
}));

vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useSearchParams as Mock).mockReturnValue({
      get: vi.fn().mockReturnValue(null),
    });
  });

  test('renders with initial values', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toHaveValue('test@example.com');
    expect(screen.getByLabelText(/password/i)).toHaveValue('password');
    expect(screen.getByLabelText(/remember me/i)).not.toBeChecked();
  });

  test('updates input values correctly', async () => {
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'new@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'newpassword' },
    });
    fireEvent.click(screen.getByLabelText(/remember me/i));

    expect(screen.getByLabelText(/email/i)).toHaveValue('new@example.com');
    expect(screen.getByLabelText(/password/i)).toHaveValue('newpassword');
    expect(screen.getByLabelText(/remember me/i)).toBeChecked();
  });

  test('submits the form with correct data', async () => {
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'new@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'newpassword' },
    });
    fireEvent.click(screen.getByLabelText(/remember me/i));

    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', {
        email: 'new@example.com',
        password: 'newpassword',
        remember: true,
        callbackUrl: '/dashboard',
      });
    });
  });

  test('displays error message when error query param is present', () => {
    (useSearchParams as Mock).mockReturnValue({
      get: vi.fn().mockReturnValue('Invalid credentials'),
    });

    render(<LoginForm />);

    expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials');
  });
});
