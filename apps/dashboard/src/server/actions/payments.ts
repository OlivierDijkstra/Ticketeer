'use server';

import { fetchWithAuth } from '@/lib/fetch';
import { createUrl } from '@/lib/utils';
import type { PaginatedResponse, Payment } from '@/types/api';

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
      tags: ['orders'],
    },
  });
}
