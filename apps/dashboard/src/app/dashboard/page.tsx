import { Suspense } from 'react';

import ChartWrapper from '@/components/charts/chart-wrapper';
import CustomersChart from '@/components/charts/customers-chart';
import RevenueChart from '@/components/charts/revenue-chart';
import SkeletonChart from '@/components/skeletons/skeleton-chart';
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
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <Suspense fallback={<SkeletonStatistic />}>
          <NewOrdersStatistic className='sm:max-w-none' />
        </Suspense>

        <Suspense fallback={<SkeletonStatistic />}>
          <RevenueStatistic className='sm:max-w-none' />
        </Suspense>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <Suspense fallback={<SkeletonChart />}>
          <ChartWrapper
            Chart={RevenueChart}
            modelType='Order'
            defaultDateRange='This year'
            defaultGranularity='month'
            aggregationType='sum'
            queryKey='revenueChart'
          />
        </Suspense>

        <Suspense fallback={<SkeletonChart />}>
          <ChartWrapper
            Chart={CustomersChart}
            modelType='Customer'
            aggregationType='count'
            defaultDateRange='This month'
            defaultGranularity='day'
            queryKey='customersChart'
          />
        </Suspense>
      </div>

      <Suspense fallback={<SkeletonTable />}>
        <EventsTable page={searchParams?.page_events} />
      </Suspense>
    </div>
  );
}
