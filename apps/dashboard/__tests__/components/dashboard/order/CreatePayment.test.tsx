import { generateOrder } from '@repo/lib';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import type { Mock } from 'vitest';
import { describe, expect, test, vi } from 'vitest';

import CreatePayment from '@/components/dashboard/order/CreatePayment';
import { createPaymentAction } from '@/server/actions/orders';

vi.mock('@/server/actions/orders', () => ({
  createPaymentAction: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    promise: vi.fn(),
  },
}));

describe('CreatePayment', () => {
  const order = generateOrder();

  test('renders button and handles payment creation', async () => {
    render(<CreatePayment order={order} />);

    const button = screen.getByRole('button', { name: /create payment/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(toast.promise).toHaveBeenCalled();
      expect(createPaymentAction).toHaveBeenCalledWith({
        order_id: order.id,
        data: { redirect_url: window.location.href },
      });
    });
  });

  test('disables button when order is paid', () => {
    render(<CreatePayment order={{ ...order, status: 'paid' }} />);

    const button = screen.getByRole('button', { name: /create payment/i });
    expect(button).toBeDisabled();
  });

  test('handles payment creation success', async () => {
    (createPaymentAction as Mock).mockResolvedValueOnce({
      payment_url: 'http://example.com',
    });

    render(<CreatePayment order={order} />);

    const button = screen.getByRole('button', { name: /create payment/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(toast.promise).toHaveBeenCalled();
      expect(createPaymentAction).toHaveBeenCalledWith({
        order_id: order.id,
        data: { redirect_url: window.location.href },
      });
    });

    expect(button).toBeDisabled();
  });
});
