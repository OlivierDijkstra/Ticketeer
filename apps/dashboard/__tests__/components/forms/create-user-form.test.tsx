import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import CreateUserForm from '@/components/forms/create-user-form';
import { createUserAction } from '@/server/actions/users';

vi.mock('@/server/actions/users', () => ({
  createUserAction: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    promise: vi.fn(),
  },
}));

describe('CreateUserForm', () => {
  const mockCallback = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders with initial values', () => {
    render(<CreateUserForm callback={mockCallback} />);

    expect(screen.getByLabelText(/name/i)).toHaveValue('');
    expect(screen.getByLabelText(/email/i)).toHaveValue('');
    expect(screen.getByLabelText(/password/i)).toHaveValue('');
  });

  test('updates input values correctly', async () => {
    const user = userEvent.setup();
    render(<CreateUserForm callback={mockCallback} />);

    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john.doe@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');

    expect(screen.getByLabelText(/name/i)).toHaveValue('John Doe');
    expect(screen.getByLabelText(/email/i)).toHaveValue('john.doe@example.com');
    expect(screen.getByLabelText(/password/i)).toHaveValue('password123');
  });

  test('submits the form with correct data', async () => {
    (createUserAction as Mock).mockResolvedValueOnce({
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
    });

    const user = userEvent.setup();
    render(<CreateUserForm callback={mockCallback} />);

    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john.doe@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /create/i }));
    });

    await waitFor(() => {
      expect(createUserAction).toHaveBeenCalledWith({
        data: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          password: 'password123',
        },
      });
    });
  });

  test('displays validation errors for required fields', async () => {
    render(<CreateUserForm callback={mockCallback} />);

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /create/i }));
    });

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
      expect(
        screen.getByText('Password must be at least 8 characters')
      ).toBeInTheDocument();
    });
  });
});
