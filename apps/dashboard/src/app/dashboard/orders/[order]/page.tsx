import { Suspense } from 'react';

import CustomerCard from '@/components/order/customer-card';
import EventCard from '@/components/order/event-card';
import OrderCard from '@/components/order/order-card';
import TicketsCard from '@/components/order/tickets-card';
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

  return (
    <div className='space-y-4'>
      <div className='flex flex-col md:grid md:grid-cols-3 md:gap-4'>
        <div className='order-2 row-start-2 flex flex-col-reverse gap-4 space-y-4 md:order-none md:col-span-2 md:row-start-1 md:block'>
          <Suspense fallback={<SkeletonGraph />}>
            <PaymentsTable
              page={searchParams?.page_payments}
              order_id={params?.order}
            />
          </Suspense>

          <EventCard show={order.show} />
        </div>

        <OrderCard className='order-1 md:order-none' order={order} />
      </div>

      <div className='grid gap-4 lg:grid-cols-2'>
        <CustomerCard customer={order.customer} />

        {order.tickets && <TicketsCard order={order} />}
      </div>
    </div>
  );
}
