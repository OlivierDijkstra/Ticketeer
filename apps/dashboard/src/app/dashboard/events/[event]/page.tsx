import { Suspense } from 'react';

import EventMediaZone from '@/components/event/event-media-zone';
import EventSettingsCard from '@/components/event/event-settings-card';
import SkeletonGraph from '@/components/skeletons/skeleton-chart';
import ShowsTable from '@/components/tables/ShowsTable/shows-table';
import { getEventAction } from '@/server/actions/events';

export default async function Page({
  params,
  searchParams,
}: {
  params: { event: string };
  searchParams?: { page_shows?: string };
}) {
  const event = await getEventAction({
    event_slug: params.event,
  });

  return (
    <div className='space-y-4'>
      <EventSettingsCard event={event} />

      <div className='grid gap-4 lg:grid-cols-2 '>
        <EventMediaZone event={event} />

        <Suspense fallback={<SkeletonGraph />}>
          <ShowsTable event_id={event.id} page={searchParams?.page_shows} />
        </Suspense>
      </div>
    </div>
  );
}
