'use server';

import type { Customer, Event, Product, Show } from '@repo/lib';
import { createUrl } from '@repo/lib';

import { fetchWithAuth } from '@/lib/fetch';

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
