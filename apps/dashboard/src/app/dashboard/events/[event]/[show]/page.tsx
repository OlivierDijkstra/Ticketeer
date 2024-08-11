import { Suspense } from 'react';

import AddressCard from '@/components/address-card';
import ShowGuestsForm from '@/components/forms/show-guests-form';
import ShowDateAvailablity from '@/components/show/show-date-availability';
import SkeletonGraph from '@/components/skeletons/skeleton-chart';
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
      <div className='mb-4 flex flex-col gap-2 md:flex-row'>
        <div className='flex md:w-2/3'>
          <ShowDateAvailablity show={show} />
        </div>

        <div className='space-y-4 md:w-1/3'>
          <AddressCard address={show.address} />

          <Card>
            <CardHeader className='bg-muted/50'>
              <CardTitle>Guests</CardTitle>
            </CardHeader>
            <CardContent className='mt-4'>
              <ShowGuestsForm show={show} />
            </CardContent>
          </Card>
        </div>
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
