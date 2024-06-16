'use server';

import { fetchWithAuth } from '@/lib/fetch';
import { createUrl } from '@/lib/utils';
import type { CreateEvent, Event, PaginatedResponse } from '@/types/api';

export async function getEventsAction({
  page,
}: {
  page?: string;
} = {}) {
  const url = createUrl('api/events', {
    page: page || 1,
  });

  return await fetchWithAuth<PaginatedResponse<Event>>(url, {
    next: {
      tags: ['events'],
    },
  });
}

export async function getEventAction({ event_slug }: { event_slug: string }) {
  return await fetchWithAuth<Event>(`api/events/${event_slug}`);
}

export async function createEventAction({ data }: { data: CreateEvent }) {
  return await fetchWithAuth<Event>('api/events', {
    method: 'POST',
    body: data,
  });
}

export async function updateEventAction({
  event_slug,
  data,
}: {
  event_slug: string;
  data: Partial<CreateEvent>;
}) {
  return await fetchWithAuth<Event>(`api/events/${event_slug}`, {
    method: 'PUT',
    body: data,
  });
}

export async function setEventFeaturedAction({
  event_slug,
}: {
  event_slug: string;
}) {
  return await fetchWithAuth<Event>(`api/events/${event_slug}`, {
    method: 'PUT',
    body: {
      featured: true,
    },
  });
}

export async function addEventMediaAction({
  event_slug,
  data,
}: {
  event_slug: string;
  data: FormData;
}) {
  return await fetchWithAuth<Event>(`api/events/${event_slug}/media`, {
    method: 'POST',
    body: data,
  });
}

export async function deleteEventMediaAction({
  event_slug,
  media_id,
}: {
  event_slug: string;
  media_id: number;
}) {
  return await fetchWithAuth<Event>(
    `api/events/${event_slug}/media/${media_id}`,
    {
      method: 'DELETE',
    }
  );
}

export async function setEventCoverAction({
  event_slug,
  media_id,
}: {
  event_slug: string;
  media_id: number;
}) {
  return await fetchWithAuth<Event>(
    `api/events/${event_slug}/media/${media_id}/cover`,
    {
      method: 'PUT',
    }
  );
}
