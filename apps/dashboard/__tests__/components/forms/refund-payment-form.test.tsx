import formatMoney, { generatePayment } from '@repo/lib';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import type { Mock } from 'vitest';
import { describe, expect, it, vi } from 'vitest';

import RefundPaymentForm from '@/components/forms/refund-payment-form';
import { refundPaymentAction } from '@/server/actions/payments';

vi.mock('@/server/actions/payments', () => ({
  refundPaymentAction: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    promise: vi.fn(),
  },
}));

describe('RefundPaymentForm', () => {
  const payment = generatePayment({
    amount: '100.00',
    amount_refunded: '20.00',
  });

  const mockCallback = vi.fn();

  it('renders with initial values', () => {
    render(<RefundPaymentForm payment={payment} callback={mockCallback} />);

    expect(screen.getByLabelText(/amount/i)).toHaveValue('$0.00');
    expect(
      screen.getByText(`Maximum amount: ${formatMoney(80.0)}`)
    ).toBeInTheDocument();
  });

  it('updates input values correctly', () => {
    render(<RefundPaymentForm payment={payment} callback={mockCallback} />);

    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: '50.00' },
    });

    expect(screen.getByLabelText(/amount/i)).toHaveValue('$50.00');
  });

  it('submits the form with correct data', async () => {
    (refundPaymentAction as Mock).mockResolvedValueOnce({});

    render(<RefundPaymentForm payment={payment} callback={mockCallback} />);

    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: '50.00' },
    });

    fireEvent.submit(screen.getByRole('button', { name: /refund/i }));

    await waitFor(() => {
      expect(toast.promise).toHaveBeenCalledWith(
        refundPaymentAction({
          payment_id: payment.id,
          data: { amount: '50.00' },
        }),
        expect.objectContaining({
          loading: 'Refunding payment...',
          success: expect.any(Function),
          error: 'Failed to refund payment',
        })
      );
    });
  });
});
