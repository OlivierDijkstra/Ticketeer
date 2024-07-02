export const dynamic = 'force-dynamic';

// import { createUrl, type Event } from '@repo/lib';

// import EventCard from '@/components/event-card';
// import { fetchJson } from '@/lib/fetch';

export default async function Page() {
  // const eventsUrl = createUrl('/api/events', {
  //   enabled: true,
  // });

  // const events = await fetchJson<Event[]>(eventsUrl, {
  //   cache: 'no-cache',
  // });

  return (
    <p>Test</p>
    // <main className='container'>
    //   {events.map((event) => (
    //     <EventCard key={event.id} event={event} />
    //   ))}
    // </main>
  );
}
