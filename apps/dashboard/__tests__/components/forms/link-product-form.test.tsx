import type { Product } from '@repo/lib';
import { generateProduct } from '@repo/lib';
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

import LinkProductForm from '@/components/forms/link-product-form';
import { TooltipProvider } from '@/components/ui/tooltip';
import { getProductsAction } from '@/server/actions/products';
import { linkProductToShowAction } from '@/server/actions/shows';

vi.mock('@/server/actions/shows', () => ({
  linkProductToShowAction: vi.fn(),
}));

vi.mock('@/server/actions/products', () => ({
  getProductsAction: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useParams: vi.fn().mockReturnValue({
    event: '1',
    show: '2',
  }),
}));

describe('LinkProductForm', () => {
  const mockCallback = vi.fn();

  const products: Product[] = [
    generateProduct({ id: 1, name: 'Product 1', price: '1000' }),
    generateProduct({ id: 2, name: 'Product 2', price: '2000' }),
  ];

  beforeEach(() => {
    (linkProductToShowAction as Mock).mockResolvedValue(products);
    (getProductsAction as Mock).mockResolvedValue(products);
  });

  test('renders with initial values', async () => {
    render(
      <TooltipProvider>
        <LinkProductForm callback={mockCallback} />
      </TooltipProvider>
    );

    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByLabelText(/adjusted price/i)).toHaveValue('€ 0,00');
    expect(screen.getByLabelText(/total available/i)).toHaveValue(1);
    expect(screen.getByLabelText(/enabled/i)).not.toBeChecked();
  });

  test('updates input values correctly', async () => {
    render(
      <TooltipProvider>
        <LinkProductForm callback={mockCallback} />
      </TooltipProvider>
    );

    const user = userEvent.setup();

    await act(async () => {
      await user.click(screen.getByRole('combobox'));
    });

    await waitFor(() =>
      screen.getByText('Product 1', {
        selector: 'span',
      })
    );

    await act(async () => {
      await user.click(
        screen.getByText('Product 1', {
          selector: 'span',
        })
      );
    });

    expect(screen.getByRole('combobox')).toHaveTextContent('Product 1');

    fireEvent.change(screen.getByLabelText(/adjusted price/i), {
      target: { value: '12.34' },
    });
    fireEvent.change(screen.getByLabelText(/total available/i), {
      target: { value: '5' },
    });

    expect(screen.getByLabelText(/adjusted price/i)).toHaveValue('€ 12,34');
    expect(screen.getByLabelText(/total available/i)).toHaveValue(5);
  });

  test('toggles checkbox values correctly', async () => {
    render(
      <TooltipProvider>
        <LinkProductForm callback={mockCallback} />
      </TooltipProvider>
    );

    const enabledCheckbox = screen.getByLabelText(/enabled/i);

    fireEvent.click(enabledCheckbox);
    expect(enabledCheckbox).toBeChecked();

    fireEvent.click(enabledCheckbox);
    expect(enabledCheckbox).not.toBeChecked();
  });

  test('submits the form with correct data', async () => {
    const mockProduct: Product = {
      id: 1,
      name: 'Test Product',
      price: '12345',
      description: 'Test Product',
      vat: 19,
      is_upsell: true,
      created_at: '2021-09-01T00:00:00Z',
      deleted_at: null,
      updated_at: '2021-09-01T00:00:00Z',
    };

    (getProductsAction as Mock).mockResolvedValueOnce([mockProduct]);

    render(
      <TooltipProvider>
        <LinkProductForm callback={mockCallback} />
      </TooltipProvider>
    );

    const user = userEvent.setup();

    await act(async () => {
      await user.click(screen.getByRole('combobox'));
    });

    await waitFor(() =>
      screen.getByText('Test Product', {
        selector: 'span',
      })
    );

    await act(async () => {
      await user.click(
        screen.getByText('Test Product', {
          selector: 'span',
        })
      );
    });

    fireEvent.change(screen.getByLabelText(/adjusted price/i), {
      target: { value: '12.34' },
    });
    fireEvent.change(screen.getByLabelText(/total available/i), {
      target: { value: 5 },
    });
    fireEvent.click(screen.getByLabelText(/enabled/i));

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /link/i }));
    });

    await waitFor(() => {
      expect(linkProductToShowAction).toHaveBeenCalledWith(
        expect.objectContaining({
          product_id: 1,
          show_id: 2,
          data: {
            product_id: 1,
            adjusted_price: '12.34',
            is_upsell: false,
            amount: 5,
            enabled: true,
          },
        })
      );
    });

    expect(mockCallback).toHaveBeenCalled();
  });
});
