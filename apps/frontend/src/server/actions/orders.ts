'use server';

import { fetchWithAuth } from '@/lib/fetch';
import type { Order } from '@/types/api';

export async function getOrderAction({ order_id }: { order_id: string }) {
  return await fetchWithAuth<Order>(`api/orders/${order_id}`, {
    next: {
      tags: ['order'],
    },
  });
}
