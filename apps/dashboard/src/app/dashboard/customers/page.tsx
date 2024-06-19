import { Suspense } from 'react';

import SkeletonGraph from '@/components/skeletons/skeleton-graph';
import SkeletonStatistic from '@/components/skeletons/skeleton-statistic';
import NewCustomersStatistic from '@/components/statistics/new-customers-statistic';
import CustomersTable from '@/components/tables/CustomersTable/customers-table';

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    page_customers?: string;
    sort_customers?: string;
  };
}) {
  return (
    <div className='space-y-4'>
      <div className='mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3'>
        <Suspense fallback={<SkeletonStatistic />}>
          <NewCustomersStatistic />
        </Suspense>
      </div>

      <Suspense fallback={<SkeletonGraph />}>
        <CustomersTable
          page={searchParams?.page_customers}
          sort={JSON.parse(searchParams?.sort_customers || '[]')}
        />
      </Suspense>
    </div>
  );
}
