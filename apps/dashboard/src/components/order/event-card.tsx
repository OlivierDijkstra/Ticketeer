import type { Show } from '@repo/lib';
import { format } from 'date-fns';
import { ArrowRight, Eye } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DEFAULT_DATE_FORMAT } from '@/lib/constants';

export default function EventCard({ show }: { show: Show }) {
  return (
    <Card className='overflow-hidden'>
      <CardHeader className='flex flex-row justify-between bg-muted/50 sm:items-center'>
        <div>
          <h1 className='font-semibold tracking-tight'>Event details</h1>
        </div>

        <div>
          <Link href={`/dashboard/events/${show.event.slug}`}>
            <Button size='sm' variant='outline'>
              <Eye className='mr-2 !size-3' /> View event
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className='mt-4 text-sm'>
        <ul className='grid gap-3'>
          <li className='flex items-center justify-between'>
            <span className='text-muted-foreground'>Event</span>
            <span>{show.event.name}</span>
          </li>

          <li className='flex items-center justify-between'>
            <span className='text-muted-foreground'>Time</span>

            <div className='flex items-center justify-between space-x-2 text-center'>
              <span className='text-left'>
                {format(new Date(show.start), DEFAULT_DATE_FORMAT)}
              </span>
              <ArrowRight className='size-2 text-muted-foreground' />
              <span className='text-right'>
                {format(new Date(show.end), DEFAULT_DATE_FORMAT)}
              </span>
            </div>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}
