import { Suspense } from 'react';

import ShowGuestsForm from '@/components/forms/show-guests-form';
import ShowDateAvailablity from '@/components/show/show-date-availability';
import SkeletonGraph from '@/components/skeletons/skeleton-graph';
import OrdersTable from '@/components/tables/OrdersTable/orders-table';
import ProductsTable from '@/components/tables/ProductsTable/products-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getShowAction } from '@/server/actions/shows';

export default async function Page({
  params,
  searchParams,
}: {
  params: { event: string; show: string };
  searchParams?: {
    page_products?: string;
    page_orders?: string;
  };
}) {
  const show = await getShowAction({
    show_id: params.show,
  });

  return (
    <div className='space-y-4'>
      <div className='mb-4 grid gap-4 lg:grid-cols-5'>
        <div className='lg:col-span-3'>
          <ShowDateAvailablity show={show} />
        </div>

        <Card className='lg:col-span-2'>
          <CardHeader className='bg-muted/50'>
            <CardTitle>Guests</CardTitle>
          </CardHeader>
          <CardContent className='mt-4'>
            <ShowGuestsForm show={show} />
          </CardContent>
        </Card>
      </div>

      <Suspense fallback={<SkeletonGraph />}>
        <ProductsTable show={show} page={searchParams?.page_products} />
      </Suspense>

      <Suspense fallback={<SkeletonGraph />}>
        <OrdersTable show={show} page={searchParams?.page_orders} />
      </Suspense>

      {/* <Suspense fallback={<SkeletonGraph />}>
        <CustomersTable show={show} page={searchParams?.page} />
      </Suspense> */}
    </div>
  );
}

export const revalidate = 0;
