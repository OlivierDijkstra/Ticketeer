import type { Customer } from '@repo/lib';
import { generateCustomer } from '@repo/lib';
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

import LinkCustomerForm from '@/components/forms/link-customer-form';
import { TooltipProvider } from '@/components/ui/tooltip';
import { getCustomersAction } from '@/server/actions/customers';
import { updateOrderAction } from '@/server/actions/orders';

vi.mock('@/server/actions/customers', () => ({
  getCustomersAction: vi.fn(),
}));

vi.mock('@/server/actions/orders', () => ({
  updateOrderAction: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useParams: vi.fn(),
}));

vi.mock('usehooks-ts', () => ({
  useDebounceCallback: vi.fn().mockImplementation((fn) => fn),
}));

describe('LinkCustomerForm', () => {
  const mockCallback = vi.fn();

  const customers: Customer[] = [
    generateCustomer({
      id: '123',
      email: 'customer1@example.com',
      first_name: 'John',
      last_name: 'Doe',
    }),
    generateCustomer({
      id: '456',
      email: 'customer2@example.com',
      first_name: 'Jane',
      last_name: 'Smith',
    }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useParams as Mock).mockReturnValue({ order: '789' });
    (getCustomersAction as Mock).mockResolvedValue(customers);
  });

  test('renders with initial values', async () => {
    render(
      <TooltipProvider>
        <LinkCustomerForm callback={mockCallback} />
      </TooltipProvider>
    );

    expect(
      screen.getByRole('combobox', { name: /customer/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /link/i })).toBeInTheDocument();
  });

  test('searches for customers correctly', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <LinkCustomerForm callback={mockCallback} />
      </TooltipProvider>
    );

    await user.click(screen.getByRole('combobox', { name: /customer/i }));

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    const customerSearchInput = screen.getByLabelText(/customer search/i);
    expect(customerSearchInput).toBeInTheDocument();

    await user.type(customerSearchInput, 'John');

    await waitFor(() => {
      expect(getCustomersAction).toHaveBeenCalledWith({ search: 'John' });
    });
  });

  test('selects a customer correctly', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <LinkCustomerForm callback={mockCallback} />
      </TooltipProvider>
    );

    await user.click(screen.getByRole('combobox', { name: /customer/i }));
    await user.click(screen.getByText('John Doe'));

    expect(
      screen.getByRole('combobox', { name: /customer/i })
    ).toHaveTextContent('John Doe');
  });

  test('submits the form with correct data', async () => {
    (updateOrderAction as Mock).mockResolvedValueOnce({});

    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <LinkCustomerForm callback={mockCallback} />
      </TooltipProvider>
    );

    await user.click(screen.getByRole('combobox', { name: /customer/i }));
    await user.click(screen.getByText('John Doe'));

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /link/i }));
    });

    await waitFor(() => {
      expect(updateOrderAction).toHaveBeenCalledWith({
        order_id: '789',
        data: {
          customer_id: '123',
        },
      });
    });

    expect(mockCallback).toHaveBeenCalled();
  });

  test('displays validation error when no customer is selected', async () => {
    render(
      <TooltipProvider>
        <LinkCustomerForm callback={mockCallback} />
      </TooltipProvider>
    );

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /link/i }));
    });

    await waitFor(() => {
      expect(screen.getByText('Customer is required')).toBeInTheDocument();
    });
  });

  test('handles error during form submission', async () => {
    const errorMessage = 'Failed to link customer';
    (updateOrderAction as Mock).mockRejectedValueOnce(new Error(errorMessage));

    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <LinkCustomerForm callback={mockCallback} />
      </TooltipProvider>
    );

    await user.click(screen.getByRole('combobox', { name: /customer/i }));
    await user.click(screen.getByText('John Doe'));

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /link/i }));
    });

    await waitFor(() => {
      expect(updateOrderAction).toHaveBeenCalled();
    });

    expect(mockCallback).not.toHaveBeenCalled();
  });
});
