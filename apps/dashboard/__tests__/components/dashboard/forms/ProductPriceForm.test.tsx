import { generateProduct } from '@repo/lib';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import ProductPriceForm from '@/components/dashboard/forms/ProductPriceForm';
import { updateProductAction } from '@/server/actions/products';

vi.mock('@/server/actions/products', () => ({
  updateProductAction: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    promise: vi.fn(),
  },
}));

describe('ProductPriceForm', () => {
  const product = generateProduct({
    id: 1,
    price: '10.00',
    vat: 19,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders with initial values', () => {
    render(<ProductPriceForm product={product} />);

    expect(screen.getByLabelText(/price/i)).toHaveValue('€ 10,00');
    expect(screen.getByLabelText(/vat/i)).toHaveValue(19);
  });

  test('updates input values correctly', async () => {
    render(<ProductPriceForm product={product} />);

    fireEvent.change(screen.getByLabelText(/price/i), {
      target: { value: '12.34' },
    });
    fireEvent.change(screen.getByLabelText(/vat/i), {
      target: { value: '20' },
    });

    expect(screen.getByLabelText(/price/i)).toHaveValue('€ 12,34');
    expect(screen.getByLabelText(/vat/i)).toHaveValue(20);
  });

  test('submits the form with correct data', async () => {
    render(<ProductPriceForm product={product} />);

    fireEvent.change(screen.getByLabelText(/price/i), {
      target: { value: '12.34' },
    });
    fireEvent.change(screen.getByLabelText(/vat/i), {
      target: { value: '20' },
    });

    fireEvent.submit(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(toast.promise).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({
          loading: 'Updating product...',
          success: 'Product updated successfully',
          error: 'Failed to update product',
        })
      );
    });

    expect(updateProductAction).toHaveBeenCalledWith({
      product_id: '1',
      data: {
        price: '12.34',
        vat: 20,
      },
    });
  });
});
