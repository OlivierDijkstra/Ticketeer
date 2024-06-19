import type { Product } from '@repo/lib';
import { generateProduct } from '@repo/lib';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { describe, expect, test, vi } from 'vitest';

import ProductTitleCard from '@/components/products/product-title-card';
import { TooltipProvider } from '@/components/ui/tooltip';
import { updateProductAction } from '@/server/actions/products';

vi.mock('@/server/actions/products', () => ({
  updateProductAction: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    promise: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockProduct: Product = generateProduct({
  id: 1,
  name: 'Test Product',
  description: 'Test Description',
  is_upsell: false,
});

describe('ProductTitleCard', () => {
  test('renders ProductTitleCard component correctly', () => {
    render(
      <TooltipProvider>
        <ProductTitleCard product={mockProduct} />
      </TooltipProvider>
    );

    expect(screen.getByText('Product')).toBeInTheDocument();
    expect(
      screen.getByText('Edit the product name and description')
    ).toBeInTheDocument();
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  test('handles name change', async () => {
    render(
      <TooltipProvider>
        <ProductTitleCard product={mockProduct} />
      </TooltipProvider>
    );

    const editButton = screen.getAllByRole('button', {
      name: /edit value/i,
    })[0] as HTMLElement;
    await userEvent.click(editButton);

    const inputField = screen.getByRole('textbox');
    await userEvent.clear(inputField);
    await userEvent.type(inputField, 'Updated Product{enter}');

    await waitFor(() => {
      expect(toast.promise).toHaveBeenCalled();
      expect(updateProductAction).toHaveBeenCalledWith({
        product_id: `${mockProduct.id}`,
        data: { name: 'Updated Product' },
      });
    });
  });

  test('handles description change', async () => {
    render(
      <TooltipProvider>
        <ProductTitleCard product={mockProduct} />
      </TooltipProvider>
    );

    const editButton = screen.getAllByRole('button', {
      name: /edit value/i,
    })[1] as HTMLElement;
    await userEvent.click(editButton);

    const textareaField = screen.getByRole('textbox');
    await userEvent.clear(textareaField);
    await userEvent.type(textareaField, 'Updated Description{enter}');

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
      expect(updateProductAction).toHaveBeenCalledWith({
        product_id: `${mockProduct.id}`,
        data: { description: 'Updated Description' },
      });
    });
  });

  test('handles upsell change', async () => {
    render(
      <TooltipProvider>
        <ProductTitleCard product={mockProduct} />
      </TooltipProvider>
    );

    const switchElement = screen.getByRole('switch');
    await userEvent.click(switchElement);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
      expect(updateProductAction).toHaveBeenCalledWith({
        product_id: `${mockProduct.id}`,
        data: { is_upsell: true },
      });
    });
  });
});
