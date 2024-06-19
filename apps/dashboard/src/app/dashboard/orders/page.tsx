import { Suspense } from 'react';

import SkeletonGraph from '@/components/skeletons/skeleton-graph';
import OrdersTable from '@/components/tables/OrdersTable/orders-table';

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
