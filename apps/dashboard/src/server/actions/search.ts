'use server';

import { fetchWithAuth } from '@/lib/fetch';
import { createUrl } from '@/lib/utils';
import type { Customer, Event, Product, Show } from '@/types/api';

export async function searchAction({
  query,
  filter,
}: {
  query: string;
  filter?: string;
}) {
  const url = createUrl('api/search', { query, filter });

  return await fetchWithAuth<{
    events: Event[];
    products: Product[];
    shows: Show[];
    customers: Customer[];
  }>(url, {
    next: {
      tags: ['search'],
    },
  });
}
