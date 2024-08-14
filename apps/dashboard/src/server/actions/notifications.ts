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

export async function notifyMonthlyReport({
  report_id,
}: {
  report_id: number;
}) {
  await fetchWithAuth('api/notifications/monthly-report', {
    method: 'POST',
    body: {
      report_id,
    },
  });
}
