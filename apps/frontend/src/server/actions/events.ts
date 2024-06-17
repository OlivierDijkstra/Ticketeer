'use server';

import { fetchWithAuth } from '@/lib/fetch';
// import { createUrl } from '@/lib/utils';
import type { Event, PaginatedResponse } from '@/types/api';

export async function getEventsAction({
  page,
}: {
  page?: string;
} = {}) {
  // const url = createUrl('api/events', {
  //   page: page || 1,
  // });

  // return await fetchWithAuth<PaginatedResponse<Event>>(url, {
  //   next: {
  //     tags: ['events'],
  //   },
  // });
}

export async function getEventAction({ event_slug }: { event_slug: string }) {
  return await fetchWithAuth<Event>(`api/events/${event_slug}`);
}