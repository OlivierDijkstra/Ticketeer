import { Suspense } from 'react';

import EventMediaZone from '@/components/event/event-media-zone';
import EventTitleCard from '@/components/event/event-title-card';
import SkeletonGraph from '@/components/skeletons/skeleton-graph';
import SkeletonStatistic from '@/components/skeletons/skeleton-statistic';
import NewOrdersStatistic from '@/components/statistics/new-orders-statstic';
import RevenueStatistic from '@/components/statistics/revenue-statistic';
import ShowsTable from '@/components/tables/ShowsTable/ShowsTable';
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
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
        <Suspense fallback={<SkeletonStatistic />}>
          <NewOrdersStatistic
            filters={{
              event: event.statistics_slug,
            }}
          />
        </Suspense>
        <Suspense fallback={<SkeletonStatistic />}>
          <RevenueStatistic
            filters={{
              event: event.statistics_slug,
            }}
          />
        </Suspense>
      </div>

      <EventTitleCard event={event} />

      <div className='grid gap-4 lg:grid-cols-2 '>
        <EventMediaZone event={event} />

        <Suspense fallback={<SkeletonGraph />}>
          <ShowsTable event_id={event.id} page={searchParams?.page_shows} />
        </Suspense>
      </div>
    </div>
  );
}
