import type { Order } from '@repo/lib';
import formatMoney, { generateOrder, generateProduct } from '@repo/lib';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { describe, expect, test, vi } from 'vitest';

import OrderCard from '@/components/order/order-card';
import { TooltipProvider } from '@/components/ui/tooltip';
import { updateOrderAction } from '@/server/actions/orders';

vi.mock('@/server/actions/orders', () => ({
  updateOrderAction: vi.fn().mockResolvedValue(() => generateOrder()),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
  },
}));

const mockOrder: Order = generateOrder({
  id: '1',
  status: 'pending',
  order_number: '12345',
  created_at: new Date().toISOString(),
  description: 'Test order description',
  products: [
    generateProduct({
      name: 'Product 1',
      pivot: {
        product_id: 1,
        show_id: 1,
        amount: 2,
        price: '10',
        adjusted_price: '9',
      },
    }),
  ],
  total: '20',
  service_fee: '1',
});

describe('OrderCard', () => {
  test('renders OrderCard component correctly', () => {
    render(
      <TooltipProvider>
        <OrderCard order={mockOrder} />
      </TooltipProvider>
    );

    expect(screen.getByText('Order 12345')).toBeInTheDocument();
    expect(screen.getByText('Test order description')).toBeInTheDocument();
    const getByTextContent = (text: string) => {
      return screen.getByText((_, node) => {
        const hasText = (node: Element | null) => node?.textContent === text;
        const nodeHasText = hasText(node);
        const childrenDontHaveText = Array.from(node?.children || []).every(
          (child) => !hasText(child)
        );
        return nodeHasText && childrenDontHaveText;
      });
    };

    expect(getByTextContent('Product 1 x 2')).toBeInTheDocument();
    expect(screen.getByText('Adjusted')).toBeInTheDocument();
    expect(getByTextContent(formatMoney(9))).toBeInTheDocument();
    expect(getByTextContent(formatMoney(20))).toBeInTheDocument();
    expect(getByTextContent(formatMoney(1))).toBeInTheDocument();
    expect(getByTextContent(formatMoney(21))).toBeInTheDocument();
  });

  test('handles description change', async () => {
    render(
      <TooltipProvider>
        <OrderCard order={mockOrder} />
      </TooltipProvider>
    );

    const editButton = screen.getByRole('button', { name: /edit value/i });
    await userEvent.click(editButton);

    const inputField = screen.getByRole('textbox');
    await userEvent.clear(inputField);
    await userEvent.type(inputField, 'Updated description{enter}');

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
      expect(updateOrderAction).toHaveBeenCalledWith({
        order_id: mockOrder.id,
        data: { description: 'Updated description' },
      });
    });
  });
});
