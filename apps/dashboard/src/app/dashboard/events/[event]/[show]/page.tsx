import { Suspense } from 'react';
import { toast } from 'sonner';

import AddressCard from '@/components/address-card';
import ShowGuestsForm from '@/components/forms/show-guests-form';
import GenerateGuestListButton from '@/components/show/generate-guest-list-button';
import ShowDateAvailablity from '@/components/show/show-date-availability';
import SkeletonGraph from '@/components/skeletons/skeleton-chart';
import OrdersTable from '@/components/tables/OrdersTable/orders-table';
import ProductsTable from '@/components/tables/ProductsTable/products-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getShowAction } from '@/server/actions/shows';
import { generateGuestListAction } from '@/server/actions/shows';

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

  async function handleGenerateGuestList() {
    await toast.promise(generateGuestListAction({ show_id: params.show }), {
      loading: 'Generating guest list...',
      success:
        "Guest list generation started. You will receive an email when it's ready.",
      error: 'Failed to generate guest list',
    });
  }

  return (
    <div className='space-y-4'>
      <div className='w-full'>
        <Card className='flex justify-end p-4'>
          <GenerateGuestListButton show={show} />
        </Card>
      </div>

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

      <div className='flex justify-end'>
        <Button onClick={handleGenerateGuestList}>Generate Guest List</Button>
      </div>

      {/* <Suspense fallback={<SkeletonGraph />}>
        <CustomersTable show={show} page={searchParams?.page} />
      </Suspense> */}
    </div>
  );
}

export const revalidate = 0;
