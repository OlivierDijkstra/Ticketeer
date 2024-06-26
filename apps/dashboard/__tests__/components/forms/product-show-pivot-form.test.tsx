import formatMoney, { generateProduct } from '@repo/lib';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import ProductShowPivotForm from '@/components/forms/product-show-pivot-form';
import { updateProductShowPivotAction } from '@/server/actions/shows';

vi.mock('@/server/actions/shows', () => ({
  updateProductShowPivotAction: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    promise: vi.fn(),
  },
}));

describe('ProductShowPivotForm', () => {
  const product = generateProduct({
    id: 1,
    pivot: {
      amount: 1,
      product_id: 1,
      stock: 1,
      adjusted_price: '10.00',
      show_id: 1,
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders with initial values', () => {
    render(<ProductShowPivotForm product={product} />);

    expect(screen.getByLabelText(/adjusted price/i)).toHaveValue(
      formatMoney('10')
    );
    expect(screen.getByLabelText(/amount/i)).toHaveValue(1);
  });

  test('updates input values correctly', () => {
    render(<ProductShowPivotForm product={product} />);

    fireEvent.change(screen.getByLabelText(/adjusted price/i), {
      target: { value: '12.34' },
    });

    expect(screen.getByLabelText(/adjusted price/i)).toHaveValue(
      formatMoney('12.34')
    );
  });

  test('submits the form with correct data', async () => {
    render(<ProductShowPivotForm product={product} />);

    fireEvent.change(screen.getByLabelText(/adjusted price/i), {
      target: { value: '12.34' },
    });

    fireEvent.submit(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(toast.promise).toHaveBeenCalledWith(
        updateProductShowPivotAction({
          show_id: 1,
          product_id: 1,
          data: { adjusted_price: '12.34', amount: 1 },
        }),
        expect.objectContaining({
          loading: 'Updating product...',
          success: expect.any(Function),
          error: 'Failed to update product',
        })
      );
    });
  });
});
