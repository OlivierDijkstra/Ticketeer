'use server';

import type { Order } from '@repo/lib';

import { API_URL } from '@/lib/constants';

export async function createOrder(data: {
  show_id: number;
  customer?: {
    email: string;
    first_name: string;
    last_name: string;
    street: string;
    street2?: string;
    city: string;
    postal_code: string;
    province: string;
    phone?: string;
  };
  products: {
    id: number;
    amount: number;
    price?: string;
  }[];
  tos: boolean;
  redirect_url?: string;
}) {
  let fullUrl = `${API_URL}`;

  if (API_URL?.endsWith('/')) {
    fullUrl = fullUrl?.slice(0, -1);
  }

  const url = '/api/orders';

  fullUrl = `${fullUrl}${url}`;

  const csrfUrl = `${API_URL}/sanctum/csrf-cookie`;

  const res = await fetch(csrfUrl, {
    method: 'GET',
    credentials: 'include',
  });

  const cookies = res.headers.get('set-cookie');
  const xsrfToken = cookies
    ?.split(';')
    .find((cookie) => cookie.trim().startsWith('XSRF-TOKEN'))
    ?.split('=')[1];

  if (!xsrfToken) {
    throw new Error('XSRF-TOKEN cookie not found');
  }

  const decodedXsrfToken = decodeURIComponent(xsrfToken);

  const orderRes = await fetch(fullUrl, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      accept: 'application/json',
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': decodedXsrfToken,
    },
    body: JSON.stringify(data),
  });

  if (!orderRes.ok) {
    throw new Error(`HTTP error! status: ${orderRes.status}`);
  }

  const orderData = await orderRes.json();
  return orderData as Order & {
    payment_url: string;
  };
}
