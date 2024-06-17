'use server';

import { fetchWithAuth } from '@/lib/fetch';
// import { createUrl } from '@/lib/utils';
import type { CreateProduct, PaginatedResponse, Product } from '@/types/api';

export async function getProductsAction({
  page,
  show_id,
  search,
  sorting,
}: {
  page?: string;
  show_id?: number;
  search?: string;
  sorting?: { id: string; desc: boolean };
} = {}) {
  // const url = createUrl('api/products', {
  //   page,
  //   show_id,
  //   search,
  //   sort: JSON.stringify(sorting),
  // });

  // const res = await fetchWithAuth<PaginatedResponse<Product> | Product[]>(url, {
  //   next: {
  //     tags: ['products'],
  //   },
  // });

  // if (search) {
  //   return res as Product[];
  // }

  // return res as PaginatedResponse<Product>;
}

export async function getProductAction({ product_id }: { product_id: string }) {
  return await fetchWithAuth<Product>(`api/products/${product_id}`, {
    next: {
      tags: ['product'],
    },
  });
}

export async function createProductAction(data: CreateProduct) {
  return await fetchWithAuth<Product>('api/products', {
    method: 'POST',
    body: data,
  });
}

export async function updateProductAction({
  product_id,
  data,
}: {
  product_id: string;
  data: Partial<Product>;
}) {
  return await fetchWithAuth<Product>(`api/products/${product_id}`, {
    method: 'PATCH',
    body: data,
  });
}

export async function deleteProductAction(id: number) {
  return await fetchWithAuth(`api/products/${id}`, {
    method: 'DELETE',
  });
}
