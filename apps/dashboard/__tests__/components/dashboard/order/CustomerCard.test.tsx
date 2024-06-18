import type { Customer } from '@repo/lib';
import { generateCustomer } from '@repo/lib';
import { render, screen } from '@testing-library/react';
import { useParams } from 'next/navigation';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import CustomerCard from '@/components/dashboard/order/CustomerCard';

vi.mock('next/navigation', () => ({
  useParams: vi.fn(),
}));

const mockCustomer: Customer = generateCustomer({
  id: '1',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  phone: '1234567890',
  address: {
    street: '123 Main St',
    street2: '',
    city: 'Anytown',
    postal_code: '12345',
    province: 'State',
    country: 'Country',
  },
});

describe('CustomerCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders CustomerCard component correctly', () => {
    (useParams as Mock).mockReturnValue({ customer: null });

    render(<CustomerCard customer={mockCustomer} />);

    expect(screen.getByText('Customer details')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('1234567890')).toBeInTheDocument();
    expect(screen.getByText('123 Main St,')).toBeInTheDocument();
    expect(screen.getByText('Anytown')).toBeInTheDocument();
    expect(screen.getByText('12345')).toBeInTheDocument();
    expect(screen.getByText('State')).toBeInTheDocument();
    // TODO: Add country field.
    // expect(screen.getByText('Country')).toBeInTheDocument();
  });

  test('renders "View customer" button when customer is provided and params.customer is null', () => {
    (useParams as Mock).mockReturnValue({ customer: null });

    render(<CustomerCard customer={mockCustomer} />);

    expect(
      screen.getByRole('button', { name: /view customer/i })
    ).toBeInTheDocument();
  });

  test('does not render "View customer" button when params.customer is not null', () => {
    (useParams as Mock).mockReturnValue({ customer: '1' });

    render(<CustomerCard customer={mockCustomer} />);

    expect(
      screen.queryByRole('button', { name: /view customer/i })
    ).not.toBeInTheDocument();
  });
});
