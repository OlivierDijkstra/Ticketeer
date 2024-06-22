import { generateAddress } from '@repo/lib';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import UpdateAddressForm from '@/components/forms/update-address-form';
import { updateAddressAction } from '@/server/actions/address';

vi.mock('@/server/actions/address', () => ({
  updateAddressAction: vi.fn(),
}));

vi.mock('i18n-iso-countries', () => ({
  __esModule: true,
  default: {
    getAlpha2Codes: vi.fn().mockReturnValue({
      US: 'United States',
      CA: 'Canada',
    }),
    getName: vi.fn((code) => {
      const names = {
        US: 'United States',
        CA: 'Canada',
      } as Record<string, string>;
      return names[code];
    }),
    registerLocale: vi.fn(),
  },
}));

describe('UpdateAddressForm', () => {
  const mockCallback = vi.fn();
  const address = generateAddress({
    street: '123 Main St',
    street2: 'Apt 4',
    city: 'Anytown',
    state: 'CA',
    postal_code: '12345',
    country: 'United States',
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders with initial values', async () => {
    render(<UpdateAddressForm address={address} callback={mockCallback} />);

    await waitFor(() => {
      expect(screen.getByLabelText('Street')).toHaveValue('123 Main St');
      expect(screen.getByLabelText(/street 2/i)).toHaveValue('Apt 4');
      expect(screen.getByLabelText(/city/i)).toHaveValue('Anytown');
      expect(screen.getByLabelText(/state/i)).toHaveValue('CA');
      expect(screen.getByLabelText(/postal code/i)).toHaveValue('12345');
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toHaveTextContent('United States');
    });
  });

  test('updates input values correctly', async () => {
    render(<UpdateAddressForm address={address} callback={mockCallback} />);

    fireEvent.change(screen.getByLabelText('Street'), {
      target: { value: '456 Elm St' },
    });
    fireEvent.change(screen.getByLabelText(/city/i), {
      target: { value: 'Othertown' },
    });

    expect(screen.getByLabelText('Street')).toHaveValue('456 Elm St');
    expect(screen.getByLabelText(/city/i)).toHaveValue('Othertown');
  });

  test('submits the form with correct data', async () => {
    (updateAddressAction as Mock).mockResolvedValueOnce(address);

    render(<UpdateAddressForm address={address} callback={mockCallback} />);

    fireEvent.change(screen.getByLabelText('Street'), {
      target: { value: '456 Elm St' },
    });
    fireEvent.change(screen.getByLabelText(/city/i), {
      target: { value: 'Othertown' },
    });

    fireEvent.submit(screen.getByRole('button', { name: /update/i }));

    await waitFor(() => {
      expect(updateAddressAction).toHaveBeenCalledWith({
        address_id: address.id,
        data: {
          street: '456 Elm St',
          street2: 'Apt 4',
          city: 'Othertown',
          state: 'CA',
          postal_code: '12345',
          country: 'United States',
        },
      });
    });

    expect(mockCallback).toHaveBeenCalled();
  });
});
