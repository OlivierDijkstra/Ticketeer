import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import ResetPasswordForm from '@/components/forms/reset-password-form';
import { sendPasswordResetLink } from '@/server/actions/users';

vi.mock('@/server/actions/users', () => ({
  sendPasswordResetLink: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

describe('ResetPasswordForm', () => {
  const mockPush = vi.fn();
  const mockGet = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as Mock).mockReturnValue({ push: mockPush });
    (useSearchParams as Mock).mockReturnValue({ get: mockGet });
  });

  test('renders with initial values', () => {
    render(<ResetPasswordForm />);

    expect(screen.getByLabelText(/email/i)).toHaveValue('');
  });

  test('updates input value correctly', () => {
    render(<ResetPasswordForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });

    expect(screen.getByLabelText(/email/i)).toHaveValue('test@example.com');
  });

  test('submits the form with correct data', async () => {
    render(<ResetPasswordForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });

    fireEvent.submit(screen.getByRole('button', { name: /reset password/i }));

    await waitFor(() => {
      expect(sendPasswordResetLink).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
    });

    expect(mockPush).toHaveBeenCalledWith(
      '?message=Email with password reset link is sent if the email is registered'
    );
  });

  test('displays validation error for invalid email', async () => {
    render(<ResetPasswordForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'invalid-email' },
    });

    fireEvent.submit(screen.getByRole('button', { name: /reset password/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
    });
  });

  test('handles error during form submission', async () => {
    (sendPasswordResetLink as Mock).mockRejectedValueOnce(
      new Error('API Error')
    );

    render(<ResetPasswordForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });

    fireEvent.submit(screen.getByRole('button', { name: /reset password/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        '?error=Error sending password reset link'
      );
    });
  });

  test('disables submit button when form is submitting', async () => {
    render(<ResetPasswordForm />);

    const submitButton = screen.getByRole('button', {
      name: /reset password/i,
    });

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });

    fireEvent.submit(submitButton);

    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(sendPasswordResetLink).toHaveBeenCalled();
    });
  });

  test('disables submit button when message is present in search params', () => {
    mockGet.mockReturnValue('Some message');

    render(<ResetPasswordForm />);

    const submitButton = screen.getByRole('button', {
      name: /reset password/i,
    });

    expect(submitButton).toBeDisabled();
  });
});
