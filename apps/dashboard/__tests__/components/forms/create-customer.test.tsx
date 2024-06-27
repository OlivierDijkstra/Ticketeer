import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useParams } from 'next/navigation';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import CreateCustomerForm from '@/components/forms/create-customer-form';
import { TooltipProvider } from '@/components/ui/tooltip';
import { createCustomerAction } from '@/server/actions/customers';
import { updateOrderAction } from '@/server/actions/orders';

vi.mock('@/server/actions/customers', () => ({
  createCustomerAction: vi.fn(),
}));

vi.mock('@/server/actions/orders', () => ({
  updateOrderAction: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useParams: vi.fn(),
}));

describe('CreateCustomerForm', () => {
  const mockCallback = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useParams as Mock).mockReturnValue({ order: '123' });
  });

  test('renders with initial values', () => {
    render(
      <TooltipProvider>
        <CreateCustomerForm callback={mockCallback} />
      </TooltipProvider>
    );

    expect(screen.getByLabelText(/first name/i)).toHaveValue('');
    expect(screen.getByLabelText(/last name/i)).toHaveValue('');
    expect(screen.getByLabelText(/email/i)).toHaveValue('');
    expect(screen.getByLabelText(/phone/i)).toHaveValue('');
  });

  test('updates input values correctly', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <CreateCustomerForm callback={mockCallback} />
      </TooltipProvider>
    );

    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/email/i), 'john.doe@example.com');
    await user.type(screen.getByLabelText(/phone/i), '+123456789');

    expect(screen.getByLabelText(/first name/i)).toHaveValue('John');
    expect(screen.getByLabelText(/last name/i)).toHaveValue('Doe');
    expect(screen.getByLabelText(/email/i)).toHaveValue('john.doe@example.com');
    expect(screen.getByLabelText(/phone/i)).toHaveValue('+123456789');
  });

  test('submits the form with correct data', async () => {
    (createCustomerAction as Mock).mockResolvedValueOnce({ id: '456' });
    (updateOrderAction as Mock).mockResolvedValueOnce({});

    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <CreateCustomerForm callback={mockCallback} />
      </TooltipProvider>
    );

    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/email/i), 'john.doe@example.com');
    await user.type(screen.getByLabelText(/phone/i), '+123456789');

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /create/i }));
    });

    await waitFor(() => {
      expect(createCustomerAction).toHaveBeenCalledWith({
        data: {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          phone: '+123456789',
        },
      });
    });

    await waitFor(() => {
      expect(updateOrderAction).toHaveBeenCalledWith({
        order_id: '123',
        data: {
          customer_id: '456',
        },
      });
    });

    expect(mockCallback).toHaveBeenCalled();
  });

  test('displays validation errors for required fields', async () => {
    render(
      <TooltipProvider>
        <CreateCustomerForm callback={mockCallback} />
      </TooltipProvider>
    );

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /create/i }));
    });

    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument();
      expect(screen.getByText('Last name is required')).toBeInTheDocument();
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
    });
  });
});
