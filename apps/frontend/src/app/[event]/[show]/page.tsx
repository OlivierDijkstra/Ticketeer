import { createUrl, type Event, type Product, type Show } from '@repo/lib';

import CreateOrderForm from '@/components/forms/create-order-form';
import { fetchJson } from '@/lib/fetch';

export default async function Page({
  params,
}: {
  params: { event: string; show: string };
}) {
  const event = await fetchJson<Event>(`/api/events/${params.event}`);

  const show = await fetchJson<Show>(`/api/shows/${params.show}`);

  const productsUrl = createUrl('/api/products', {
    show_id: params.show,
  });

  const products = await fetchJson<Product[]>(productsUrl);

  return (
    <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
      <div>
        <h1 className='mb-4 text-4xl font-bold'>{event.name}</h1>
        <p className='mb-2 text-muted-foreground'>{event.description}</p>
      </div>

      <div className='lg:col-span-2'>
        <CreateOrderForm products={products} show={show} />
      </div>
    </div>
  );
}
