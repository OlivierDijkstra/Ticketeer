'use server';

import type { PaginatedResponse, Payment } from '@repo/lib';
import { createUrl } from '@repo/lib';

import { fetchWithAuth } from '@/lib/fetch';

export async function getPaymentsActions({
  page,
  order_id,
}: {
  page?: string;
  order_id?: string;
} = {}) {
  const url = createUrl(`api/orders/${order_id}/payments`, {
    page: page || 1,
    show_id: order_id,
  });

  return await fetchWithAuth<PaginatedResponse<Payment>>(url, {
    next: {
      tags: ['payments'],
    },
  });
}

export async function refundPaymentAction({
  payment_id,
  data,
}: {
  payment_id: string;
  data: {
    amount: string;
  };
}) {
  return await fetchWithAuth(`api/payments/${payment_id}/refund`, {
    method: 'POST',
    body: {
      amount: data.amount,
    },
  });
}
