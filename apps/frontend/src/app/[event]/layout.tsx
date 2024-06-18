import type { Event } from '@repo/lib';
import Image from 'next/image';
import type { ReactNode } from 'react';

import { fetchJson } from '@/lib/fetch';

export default async function RootLayout({
  params,
  children,
}: Readonly<{
  params: { event: string };
  children: ReactNode;
}>) {
  const event = await fetchJson<Event>(`/api/events/${params.event}`);

  return (
    <div className='container relative isolate max-w-screen-2xl pt-4'>
      <main className='rounded-xl border-2 bg-white p-4 shadow-2xl'>
        {children}
      </main>

      <div className='masonry absolute inset-0 -z-10 w-screen opacity-25'>
        {event.media.map((media) => (
          <div key={media.id} className='overflow-hidden rounded-xl'>
            <Image
              src={media.original_url}
              blurDataURL={media.custom_properties.base64}
              alt='Decorative image for event'
              placeholder='blur'
              width={800}
              height={600}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
