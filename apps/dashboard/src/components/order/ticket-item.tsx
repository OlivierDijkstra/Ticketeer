'use client';

import type { Show, Ticket } from '@repo/lib';
import { format } from 'date-fns';
import { MapPinIcon, TicketIcon } from 'lucide-react';

import { DEFAULT_PRETTY_DATE_FORMAT } from '@/lib/constants';

export default function TicketItem({
  ticket,
  show,
}: {
  ticket: Ticket;
  show: Show;
}) {
  return (
    <div className='rounded-lg bg-card'>
      <div className='rounded-lg bg-muted p-4'>
        <div className='flex items-start justify-between gap-2'>
          <div className='w-1/2 space-y-2'>
            <p className='flex items-center gap-1 text-sm font-semibold'>
              <TicketIcon />
              <span>{ticket.product.name}</span>
            </p>

            <p className='line-clamp-5 text-xs text-muted-foreground'>
              {ticket.product.description}
            </p>
          </div>

          <div className='h-20 w-px bg-border' />

          <div>
            <p className='text-right text-xs font-semibold uppercase tracking-wider'>
              {show?.event.name}
            </p>
            <p className='text-right text-xs text-muted-foreground'>
              {format(show.start, DEFAULT_PRETTY_DATE_FORMAT)}
            </p>

            <div className='mt-2 flex items-center gap-2 rounded-md bg-background p-2'>
              <MapPinIcon className='h-4 w-4' />
              <div className='text-xs font-semibold'>
                <p>
                  {show.address.city}, {show.address.country}
                </p>
                <p className='font-normal text-muted-foreground'>
                  {show.address.street} {show.address.street2}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
