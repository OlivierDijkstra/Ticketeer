import { columns } from '@/components/dashboard/tables/PaymentsTable/Columns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { getPaymentsActions } from '@/server/actions/payments';

export default async function PaymentsTable({
  order_id,
  page,
}: {
  order_id: string;
  page?: string;
}) {
  async function getPayments({ page }: { page?: string }) {
    'use server';
    return await getPaymentsActions({ order_id, page });
  }

  const payments = await getPayments({ page });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payments</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={payments} refetch={getPayments} tableId='payments' />
      </CardContent>
    </Card>
  );
}
