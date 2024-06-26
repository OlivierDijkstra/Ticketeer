import CreatePayment from '@/components/order/create-payment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { getOrderAction } from '@/server/actions/orders';
import { getPaymentsActions } from '@/server/actions/payments';

import { columns } from './columns';

export default async function PaymentsTable({
  order_id,
  page,
}: {
  order_id: string;
  page?: string;
}) {
  const order = await getOrderAction({
    order_id,
  });

  async function getPayments({ page }: { page?: string }) {
    'use server';
    return await getPaymentsActions({ order_id, page });
  }

  const payments = await getPayments({ page });

  return (
    <Card>
      <CardHeader className='flex-row items-center justify-between gap-2'>
        <CardTitle>Payments</CardTitle>

        <CreatePayment order={order} />
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={payments}
          refetch={getPayments}
          tableId='payments'
        />
      </CardContent>
    </Card>
  );
}
