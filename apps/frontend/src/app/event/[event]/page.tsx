import { createUrl, type Event, type Show } from '@repo/lib';

import ShowCard from '@/components/show-card';
import { fetchJson } from '@/lib/fetch';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: { event: string } }) {
  const event = await fetchJson<Event>(`/api/events/${params.event}`);

  const showsUrl = createUrl('/api/shows/', {
    event_id: event.id,
    enabled: true,
  });

  const shows = await fetchJson<Show[]>(showsUrl);

  return (
    <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
      <div>
        <h1 className='mb-4 text-4xl font-bold'>{event.name}</h1>
        <p className='text-muted-foreground'>{event.description}</p>
      </div>

      <div className='col-span-2 mt-2 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3'>
        {shows.map((show) => (
          <ShowCard key={show.id} show={show} />
        ))}
      </div>
    </div>
  );
}
