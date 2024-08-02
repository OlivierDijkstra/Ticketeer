import { Suspense } from 'react';

import EventMediaZone from '@/components/event/event-media-zone';
import EventSettingsCard from '@/components/event/event-settings-card';
import SkeletonGraph from '@/components/skeletons/skeleton-graph';
import SkeletonStatistic from '@/components/skeletons/skeleton-statistic';
import NewOrdersStatistic from '@/components/statistics/new-orders-statistic';
import RevenueStatistic from '@/components/statistics/revenue-statistic';
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
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
        <Suspense fallback={<SkeletonStatistic />}>
          <NewOrdersStatistic
            filters={[
              {
                member: 'events.slug',
                operator: 'equals',
                values: [event.statistics_slug],
              },
            ]}
          />
        </Suspense>
        <Suspense fallback={<SkeletonStatistic />}>
          <RevenueStatistic
            filters={[
              {
                member: 'events.slug',
                operator: 'equals',
                values: [event.statistics_slug],
              },
            ]}
          />
        </Suspense>
      </div>

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
