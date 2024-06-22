import type { Address } from '@repo/lib';
import { generateAddress } from '@repo/lib';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import AddressCard from '@/components/address-card';

const mockAddress: Address = generateAddress({
  street: '123 Main St',
  street2: 'Apt 4',
  city: 'Anytown',
  state: 'CA',
  postal_code: '12345',
  country: 'United States',
});

describe('AddressCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders AddressCard component correctly', () => {
    render(<AddressCard address={mockAddress} />);

    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('123 Main St, Apt 4')).toBeInTheDocument();
    expect(screen.getByText('Anytown')).toBeInTheDocument();
    expect(screen.getByText('12345')).toBeInTheDocument();
    expect(screen.getByText('CA')).toBeInTheDocument();
    expect(screen.getByText('United States')).toBeInTheDocument();
  });

  test('renders "Update" button when address is provided', () => {
    render(<AddressCard address={mockAddress} />);

    expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument();
  });

  test('does not render "Update" button when address is not provided', () => {
    render(<AddressCard address={undefined} />);

    expect(
      screen.queryByRole('button', { name: /update/i })
    ).not.toBeInTheDocument();
  });
});
