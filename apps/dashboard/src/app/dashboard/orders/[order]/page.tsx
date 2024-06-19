import { Suspense } from 'react';

import CustomerCard from '@/components/order/customer-card';
import EventCard from '@/components/order/event-card';
import OrderCard from '@/components/order/order-card';
import SkeletonGraph from '@/components/skeletons/skeleton-graph';
import PaymentsTable from '@/components/tables/PaymentsTable/payments-table';
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

  console.log('order', order.products[0])

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
