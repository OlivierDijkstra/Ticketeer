import type { Show } from '@repo/lib';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Ticket } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card';

export default function ShowCard({ show }: { show: Show }) {
  const startTime = format(new Date(show.start), 'HH:mm');
  const endTime = format(new Date(show.end), 'HH:mm');
  const startDate = format(new Date(show.start), 'yyyy-MM-dd');
  const endDate = format(new Date(show.end), 'yyyy-MM-dd');

  return (
    <Card className='transition-all hover:scale-[1.01] hover:shadow-lg contain-paint'>
      <Link href={`/${show.event.slug}/${show.id}`}>
        <CardHeader className='bg-muted/50'>
          <CardDescription className='font-medium text-foreground/75'>
            {show.description}
          </CardDescription>
        </CardHeader>

        <CardContent className='mt-2 flex flex-col justify-between'>
          <div className='space-y-1 text-muted-foreground'>
            <div className='flex items-center gap-2'>
              <Clock />
              <span>
                {startTime} - {endTime}
              </span>
            </div>

            <div className='flex items-center gap-2'>
              <Calendar />
              <span>
                {startDate === endDate
                  ? startDate
                  : `${startDate} - ${endDate}`}
              </span>
            </div>

            <div className='flex items-center gap-2'>
              <MapPin />
              <span>{`${show.address.city}, ${show.address.street}`}</span>
            </div>
          </div>

          <div className='my-4 font-medium'>
            <p className='mb-1'>Guests</p>

            <div className='flex flex-row flex-wrap items-center gap-1'>
              {show.guests.map((guest) => (
                <span
                  key={guest}
                  className='rounded-md bg-foreground/5 px-2 py-1 text-sm'
                >
                  {guest}
                </span>
              ))}
            </div>
          </div>

          <Button size='lg' className='w-full'>
            <Ticket className='mr-2' />
            Get Tickets
          </Button>
        </CardContent>
      </Link>
    </Card>
  );
}
