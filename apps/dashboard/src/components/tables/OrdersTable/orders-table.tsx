import type { Show } from '@repo/lib';
import { Plus } from 'lucide-react';

import CreateOrderDialog from '@/components/dialogs/create-order-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { getOrdersAction } from '@/server/actions/orders';

import { columns } from './columns';

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

        <CreateOrderDialog>
          <Button>
            <Plus className='mr-2 size-3' />
            <span>Add Order</span>
          </Button>
        </CreateOrderDialog>
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
