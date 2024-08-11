import { Suspense } from 'react';

import SkeletonTable from '@/components/skeletons/skeleton-table';
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
      <Suspense fallback={<SkeletonTable />}>
        <CustomersTable
          page={searchParams?.page_customers}
          sort={JSON.parse(searchParams?.sort_customers || '[]')}
        />
      </Suspense>
    </div>
  );
}
