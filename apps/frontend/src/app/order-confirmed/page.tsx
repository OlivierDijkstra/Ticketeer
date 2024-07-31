import type { Show } from '@repo/lib';
import { CheckIcon, HomeIcon, MailIcon, ShoppingCartIcon } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import GuestBadge from '@/components/guest-badge';
import { Button } from '@/components/ui/button';
import { fetchJson } from '@/lib/fetch';

export const dynamic = 'force-dynamic';

export default async function Page({
  searchParams,
}: {
  searchParams: {
    order_id: string;
    show_id: string;
  };
}) {
  const { order_id, show_id } = searchParams;
  if (!order_id || !show_id) {
    redirect('/');
  }

  const show = await fetchJson<Show>(`/api/shows/${show_id}`);
  const event = show.event;

  return (
    <main className='container'>
      <div className='flex flex-col items-center justify-center gap-6 p-8 sm:p-12 md:p-16'>
        <div className='flex h-16 w-16 items-center justify-center rounded-full bg-green-500'>
          <CheckIcon className='!h-8 !w-8 text-white' />
        </div>
        <div className='space-y-2 text-center'>
          <h2 className='text-2xl font-bold'>Payment Successful!</h2>
          <p className='text-muted-foreground'>
            Thank you for your purchase. We appreciate your business.
          </p>
        </div>
        <div className='grid w-full max-w-lg gap-4 rounded-md border bg-background p-6 text-sm'>
          <div className='flex items-center justify-between'>
            <span>Order Number:</span>
            <span className='font-medium'>{order_id}</span>
          </div>

          <div className='flex items-center justify-between'>
            <span>Event:</span>
            <span className='font-medium'>{event.name}</span>
          </div>

          <div className='flex items-center justify-between'>
            <span>Show:</span>
            <span className='text-right font-medium'>{show.description}</span>
          </div>

          <div className='flex items-center justify-between'>
            <span>Guest:</span>
            <div className='flex flex-row flex-wrap items-center gap-1'>
              {show.guests.map((guest) => (
                <GuestBadge key={guest}>{guest}</GuestBadge>
              ))}
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-2 sm:flex-row'>
          <Link href='/'>
            <Button className='w-full sm:w-auto'>
              <HomeIcon className='mr-2' />
              Return to Home
            </Button>
          </Link>
          <Link href={`/event/${event.slug}`}>
            <Button variant='outline' className='w-full sm:w-auto'>
              <ShoppingCartIcon className='mr-2' />
              Go To Event
            </Button>
          </Link>
          <Link href={`/event/${event.slug}`}>
            <Button disabled variant='outline' className='w-full sm:w-auto'>
              <MailIcon className='mr-2' />
              Request Invoice
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
