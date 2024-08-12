import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import PasswordResetForm from '@/components/forms/password-reset-form';
import { resetPassword } from '@/server/actions/users';

vi.mock('@/server/actions/users', () => ({
  resetPassword: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('PasswordResetForm', () => {
  const mockPush = vi.fn();
  const token = 'test-token';
  const email = 'test@example.com';

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as Mock).mockReturnValue({ push: mockPush });
  });

  test('renders with initial values', () => {
    render(<PasswordResetForm token={token} email={email} />);

    expect(screen.getByLabelText('password')).toHaveValue('');
    expect(screen.getByLabelText('confirm password')).toHaveValue('');
  });

  test('updates input values correctly', () => {
    render(<PasswordResetForm token={token} email={email} />);

    fireEvent.change(screen.getByLabelText('password'), {
      target: { value: 'newpassword123' },
    });
    fireEvent.change(screen.getByLabelText('confirm password'), {
      target: { value: 'newpassword123' },
    });

    expect(screen.getByLabelText('password')).toHaveValue('newpassword123');
    expect(screen.getByLabelText('confirm password')).toHaveValue(
      'newpassword123'
    );
  });

  test('submits the form with correct data', async () => {
    render(<PasswordResetForm token={token} email={email} />);

    fireEvent.change(screen.getByLabelText('password'), {
      target: { value: 'newpassword123' },
    });
    fireEvent.change(screen.getByLabelText('confirm password'), {
      target: { value: 'newpassword123' },
    });

    fireEvent.submit(screen.getByRole('button', { name: /reset password/i }));

    await waitFor(() => {
      expect(resetPassword).toHaveBeenCalledWith({
        token,
        email,
        password: 'newpassword123',
        password_confirmation: 'newpassword123',
      });
    });

    expect(mockPush).toHaveBeenCalledWith(
      '/?message=Password reset successful'
    );
  });

  test('displays validation error for password mismatch', async () => {
    render(<PasswordResetForm token={token} email={email} />);

    fireEvent.change(screen.getByLabelText('password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText('confirm password'), {
      target: { value: 'password456' },
    });

    fireEvent.submit(screen.getByRole('button', { name: /reset password/i }));

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  test('displays validation error for short password', async () => {
    render(<PasswordResetForm token={token} email={email} />);

    fireEvent.change(screen.getByLabelText('password'), {
      target: { value: 'short' },
    });
    fireEvent.change(screen.getByLabelText('confirm password'), {
      target: { value: 'short' },
    });

    fireEvent.submit(screen.getByRole('button', { name: /reset password/i }));

    await waitFor(() => {
      const errors = screen.getAllByText(
        'Password must be at least 8 characters'
      );

      expect(errors).toHaveLength(2);
    });
  });

  test('handles error during form submission', async () => {
    (resetPassword as Mock).mockRejectedValueOnce(new Error('API Error'));

    render(<PasswordResetForm token={token} email={email} />);

    fireEvent.change(screen.getByLabelText('password'), {
      target: { value: 'newpassword123' },
    });
    fireEvent.change(screen.getByLabelText('confirm password'), {
      target: { value: 'newpassword123' },
    });

    fireEvent.submit(screen.getByRole('button', { name: /reset password/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        `?error=Password reset failed&email=${encodeURIComponent(email)}`
      );
    });
  });
});
