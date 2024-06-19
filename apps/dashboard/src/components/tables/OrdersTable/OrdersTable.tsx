import type { Show } from '@repo/lib';

import CreateOrderDialog from '@/components/dialogs/CreateOrderDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { getOrdersAction } from '@/server/actions/orders';

import { columns } from './Columns';

export default async function OrdersTable({
  show,
  page,
}: {
  show?: Show;
  page?: string;
}) {
  async function getOrders({ page }: { page?: string }) {
    'use server';
    return await getOrdersAction({ page, show_id: show?.id });
  }

  const orders = await getOrders({ page });

  return (
    <Card>
      <CardHeader className='flex-row items-center justify-between'>
        <CardTitle>Orders</CardTitle>

        <CreateOrderDialog />
      </CardHeader>

      <CardContent>
        <DataTable
          columns={columns}
          data={orders}
          refetch={getOrders}
          tableId='orders'
        />
      </CardContent>
    </Card>
  );
}
