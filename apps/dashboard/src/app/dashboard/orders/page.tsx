import { Suspense } from 'react';

import SkeletonGraph from '@/components/dashboard/skeletons/SkeletonGraph';
import OrdersTable from '@/components/dashboard/tables/OrdersTable/OrdersTable';

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    page_orders?: string;
  };
}) {
  return (
    <Suspense fallback={<SkeletonGraph />}>
      <OrdersTable page={searchParams?.page_orders} />
    </Suspense>
  );
}
