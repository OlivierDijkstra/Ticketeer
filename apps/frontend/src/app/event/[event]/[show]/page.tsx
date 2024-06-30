import { createUrl, type Event, type Show } from '@repo/lib';

import CreateOrderForm from '@/components/forms/create-order-form';
import { fetchJson } from '@/lib/fetch';

export default async function Page({
  params,
}: {
  params: { event: string; show: string };
}) {
  const event = await fetchJson<Event>(
    `/api/events/${params.event}?enabled=true`
  );

  const showUrl = createUrl(`/api/shows/${params.show}`, {
    enabled: true,
  });

  const show = await fetchJson<Show>(showUrl);

  return (
    <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
      <div>
        <h1 className='mb-4 text-4xl font-bold'>{event.name}</h1>
        <p className='mb-2 text-muted-foreground'>{event.description}</p>
      </div>

      <div className='lg:col-span-2'>
        <CreateOrderForm
          products={show.products.filter((product) => product.pivot?.enabled)}
          show={show}
        />
      </div>
    </div>
  );
}
