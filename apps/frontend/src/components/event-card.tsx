import type { Event } from '@repo/lib';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { getEventCoverImage } from '@/lib/utils';

export default function EventCard({ event }: { event: Event }) {
  const eventCoverImage = getEventCoverImage(event);

  return (
    <Card className='group w-full rounded-lg shadow-lg contain-paint'>
      <Image
        src={eventCoverImage?.original_url || '/placeholder.svg'}
        alt='Event Image'
        width={500}
        height={300}
        className='h-48 w-full object-cover'
        priority
      />

      <Link href={`/${event.slug}`}>
        <CardContent className='space-y-2 p-4'>
          <CardTitle className='text-xl font-semibold'>{event.name}</CardTitle>

          <div className='flex justify-between'>
            <CardDescription>{event.description_short}</CardDescription>

            <ArrowRight className='mt-1 transition-transform group-hover:translate-x-1' />
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
