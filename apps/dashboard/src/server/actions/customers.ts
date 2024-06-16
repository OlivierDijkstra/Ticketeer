'use server';

import { fetchWithAuth } from '@/lib/fetch';
import { createUrl } from '@/lib/utils';
import type { Customer, PaginatedResponse } from '@/types/api';

export async function getCustomersAction({
  search,
  page,
  sorting,
  show_id,
}: {
  search?: string;
  page?: string;
  sorting?: { id: string; desc: boolean };
  show_id?: number;
}) {
  const url = createUrl('api/customers', {
    search,
    page: page || '1',
    sort: JSON.stringify(sorting),
    show_id: show_id,
  });

  return await fetchWithAuth<PaginatedResponse<Customer>>(url, {
    next: {
      tags: ['customers'],
    },
  });
}

export async function getCustomerAction({
  customer_id,
}: {
  customer_id: string;
}) {
  return await fetchWithAuth<Customer>(`api/customers/${customer_id}`, {
    next: {
      tags: ['customers'],
    },
  });
}
