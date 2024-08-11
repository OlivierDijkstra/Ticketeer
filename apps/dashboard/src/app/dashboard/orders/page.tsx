import { Suspense } from 'react';

import SkeletonGraph from '@/components/skeletons/skeleton-chart';
import SkeletonStatistic from '@/components/skeletons/skeleton-statistic';
import NewOrdersStatistic from '@/components/statistics/new-orders-statistic';
import OrdersTable from '@/components/tables/OrdersTable/orders-table';

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    page_orders?: string;
  };
}) {
  return (
    <div className='space-y-4'>
      <div className='mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3'>
        <Suspense fallback={<SkeletonStatistic />}>
          <NewOrdersStatistic />
        </Suspense>
      </div>

      <Suspense fallback={<SkeletonGraph />}>
        <OrdersTable page={searchParams?.page_orders} />
      </Suspense>
    </div>
  );
}
