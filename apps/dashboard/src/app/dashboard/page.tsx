import { Suspense } from 'react';

import RevenueGraph from '@/components/graphs/revenue-graph';
import SkeletonGraph from '@/components/skeletons/skeleton-graph';
import SkeletonStatistic from '@/components/skeletons/skeleton-statistic';
import SkeletonTable from '@/components/skeletons/skeleton-table';
import NewOrdersStatistic from '@/components/statistics/new-orders-statistic';
import RevenueStatistic from '@/components/statistics/revenue-statistic';
import EventsTable from '@/components/tables/EventsTable/events-table';

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    page_events?: string;
  };
}) {
  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
        <Suspense fallback={<SkeletonStatistic />}>
          <NewOrdersStatistic />
        </Suspense>
        <Suspense fallback={<SkeletonStatistic />}>
          <RevenueStatistic />
        </Suspense>
      </div>

      <div>
        <Suspense fallback={<SkeletonGraph />}>
          <RevenueGraph />
        </Suspense>
      </div>

      <Suspense fallback={<SkeletonTable />}>
        <EventsTable page={searchParams?.page_events} />
      </Suspense>
    </div>
  );
}
