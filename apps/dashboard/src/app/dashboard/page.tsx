import { Suspense } from 'react';

import SkeletonGraph from '@/components/dashboard/skeletons/SkeletonGraph';
import SkeletonStatistic from '@/components/dashboard/skeletons/SkeletonStatistic';
import SkeletonTable from '@/components/dashboard/skeletons/SkeletonTable';
import NewOrdersStatistic from '@/components/dashboard/statistics/NewOrdersStatistic';
import RevenueGraph from '@/components/dashboard/statistics/RevenueGraph';
import RevenueStatistic from '@/components/dashboard/statistics/RevenueStatistic';
import EventsTable from '@/components/dashboard/tables/EventsTable/EventsTable';

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    page_events?: string;
  };
}) {
  return (
    <div>
      <div className='mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3'>
        <Suspense fallback={<SkeletonStatistic />}>
          <NewOrdersStatistic />
        </Suspense>
        <Suspense fallback={<SkeletonStatistic />}>
          <RevenueStatistic />
        </Suspense>
      </div>

      <div className='mb-2'>
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
