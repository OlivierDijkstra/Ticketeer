import { Suspense } from 'react';

import SkeletonGraph from '@/components/skeletons/SkeletonGraph';
import CustomersTable from '@/components/tables/CustomersTable/CustomersTable';

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    page_customers?: string;
    sort_customers?: string;
  };
}) {
  return (
    <Suspense fallback={<SkeletonGraph />}>
      <CustomersTable
        page={searchParams?.page_customers}
        sort={JSON.parse(searchParams?.sort_customers || '[]')}
      />
    </Suspense>
  );
}
