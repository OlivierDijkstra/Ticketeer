import { Suspense } from 'react';

import EventMediaZone from '@/components/dashboard/event/EventMediaZone';
import EventTitleCard from '@/components/dashboard/event/EventTitleCard';
import SkeletonGraph from '@/components/dashboard/skeletons/SkeletonGraph';
import SkeletonStatistic from '@/components/dashboard/skeletons/SkeletonStatistic';
import NewOrdersStatistic from '@/components/dashboard/statistics/NewOrdersStatistic';
import RevenueStatistic from '@/components/dashboard/statistics/RevenueStatistic';
import ShowsTable from '@/components/dashboard/tables/ShowsTable/ShowsTable';
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
