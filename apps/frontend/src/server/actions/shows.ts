'use server';

import { fetchWithAuth } from '@/lib/fetch';
// import { createUrl } from '@/lib/utils';
import type {
  CreateShow,
  LinkProduct,
  PaginatedResponse,
  Product,
  ProductShowPivot,
  Show,
} from '@/types/api';

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
  // const url = createUrl('api/shows', {
  //   event_id,
  //   page,
  //   search,
  // });

  // const res = await fetchWithAuth<PaginatedResponse<Show> | Show[]>(url, {
  //   next: {
  //     tags: ['shows'],
  //   },
  // });

  // if (search) {
  //   return res as Show[];
  // }

  // return res as PaginatedResponse<Show>;
}