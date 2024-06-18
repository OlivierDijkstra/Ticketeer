import { Suspense } from 'react';

import CustomerCard from '@/components/dashboard/order/CustomerCard';
import EventCard from '@/components/dashboard/order/EventCard';
import OrderCard from '@/components/dashboard/order/OrderCard';
import SkeletonGraph from '@/components/dashboard/skeletons/SkeletonGraph';
import PaymentsTable from '@/components/dashboard/tables/PaymentsTable/PaymentsTable';
import { getOrderAction } from '@/server/actions/orders';

export default async function Page({
  params,
  searchParams,
}: {
  params: { order: string };
  searchParams?: {
    page_payments?: string;
  };
}) {
  const order = await getOrderAction({
    order_id: params?.order,
  });

  return (
    <div className='grid gap-4 md:grid-cols-3'>
      <div className='row-start-2 space-y-4 md:col-span-2 md:row-start-1'>
        <Suspense fallback={<SkeletonGraph />}>
          <PaymentsTable
            page={searchParams?.page_payments}
            order_id={params?.order}
          />
        </Suspense>

        <div className='grid gap-4 lg:grid-cols-2'>
          <EventCard show={order.show} />

          <CustomerCard customer={order.customer} />
        </div>
      </div>

      <OrderCard order={order} />
    </div>
  );
}
