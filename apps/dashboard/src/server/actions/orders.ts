'use server';

import type { Order, PaginatedResponse } from '@repo/lib';
import { createUrl } from '@repo/lib';

import { fetchWithAuth } from '@/lib/fetch';

export async function getOrdersAction({
  page,
  show_id,
}: {
  page?: string;
  show_id?: number;
} = {}) {
  const url = createUrl('api/orders', {
    page: page || 1,
    show_id: show_id,
  });

  return await fetchWithAuth<PaginatedResponse<Order>>(url, {
    next: {
      tags: ['orders'],
    },
  });
}

export async function getOrderAction({ order_id }: { order_id: string }) {
  return await fetchWithAuth<Order>(`api/orders/${order_id}`, {
    next: {
      tags: ['order'],
    },
  });
}

export async function createOrdersAction(data: {
  show_id: number;
  customer?: {
    email: string;
    first_name: string;
    last_name: string;
    street: string;
    street2?: string;
    city: string;
    postal_code: string;
    state: string;
    phone?: string;
  };
  products: {
    id: number;
    amount: number;
    price?: string;
  }[];
}) {
  // Generate a redirect url and add a slash after nextuaht_url only if required if its missing
  let redirect_url = process.env.NEXTAUTH_URL;
  if (!redirect_url?.endsWith('/')) {
    redirect_url += '/';
  }

  redirect_url += 'dashboard/orders';

  return await fetchWithAuth<
    Order & {
      payment_url: string;
    }
  >('api/orders', {
    method: 'POST',
    body: {
      ...data,
      tos: true,
      redirect_url,
    },
    next: {
      tags: ['orders'],
    },
  });
}

export async function createPaymentAction({
  order_id,
  data,
}: {
  order_id: string;
  data: {
    redirect_url: string;
  };
}) {
  return await fetchWithAuth<{ payment_url: string }>(
    `api/orders/${order_id}/payment-link`,
    {
      method: 'POST',
      body: data,
    }
  );
}

export async function updateOrderAction({
  order_id,
  data,
}: {
  order_id: string;
  data: {
    description: string | null;
  };
}) {
  return await fetchWithAuth<Order>(`api/orders/${order_id}`, {
    method: 'PATCH',
    body: data,
  });
}
