'use server';

import { fetchWithAuth } from '@/lib/fetch';

export async function notifyTickets({ order_id }: { order_id: string }) {
  await fetchWithAuth('api/notifications/tickets', {
    method: 'POST',
    body: {
      order_id,
    },
  });
}
