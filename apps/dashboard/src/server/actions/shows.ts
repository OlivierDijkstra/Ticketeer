'use server';

import type {
  CreateShow,
  LinkProduct,
  PaginatedResponse,
  Product,
  ProductShowPivot,
  Show,
} from '@repo/lib';
import { createUrl } from '@repo/lib';

import { fetchWithAuth } from '@/lib/fetch';

export async function getShowAction({ show_id }: { show_id: string }) {
  return await fetchWithAuth<Show>(`api/shows/${show_id}`, {
    next: {
      tags: ['show'],
    },
  });
}

export async function getShowsAction({
  event_id,
  page,
  search,
}: {
  event_id?: number;
  page?: string;
  search?: string;
}) {
  const url = createUrl('api/shows', {
    event_id,
    page,
    search,
  });

  const res = await fetchWithAuth<PaginatedResponse<Show> | Show[]>(url, {
    next: {
      tags: ['shows'],
    },
  });

  if (search) {
    return res as Show[];
  }

  return res as PaginatedResponse<Show>;
}

export async function createShowAction({
  event_slug,
  data,
}: {
  event_slug: string;
  data: CreateShow;
}) {
  return await fetchWithAuth<Show>(`api/events/${event_slug}/shows`, {
    method: 'POST',
    body: data,
  });
}

export async function updateShowAction({
  show_id,
  data,
}: {
  show_id: number;
  data: Partial<Show>;
}) {
  return await fetchWithAuth<Show>(`api/shows/${show_id}}`, {
    method: 'PUT',
    body: data,
  });
}

export async function linkProductToShowAction({
  show_id,
  product_id,
  data,
}: {
  show_id: number;
  product_id: number;
  data: LinkProduct;
}) {
  return await fetchWithAuth<Product>(
    `api/shows/${show_id}/products/${product_id}`,
    {
      method: 'POST',
      body: data,
    }
  );
}

export async function updateProductShowPivotAction({
  show_id,
  product_id,
  data,
}: {
  show_id: number;
  product_id: number;
  data: Partial<ProductShowPivot>;
}) {
  return await fetchWithAuth<Product>(
    `api/shows/${show_id}/products/${product_id}`,
    {
      method: 'PUT',
      body: data,
    }
  );
}

export async function unlinkProductFromShowAction({
  show_id,
  product_id,
}: {
  show_id: number;
  product_id: number;
}) {
  return await fetchWithAuth<Product>(
    `api/shows/${show_id}/products/${product_id}`,
    {
      method: 'DELETE',
    }
  );
}
