import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { getCustomersAction } from '@/server/actions/customers';
import type { Show } from '@/types/api';

import { columns } from './Columns';

export default async function CustomersTable({
  show,
  page,
  sort
}: {
  show?: Show;
  page?: string;
  sort?: { id: string; desc: boolean };
}) {
  async function getCustomers({
    page,
    sorting,
  }: {
    page?: string;
    sorting?: { id: string; desc: boolean };
  }) {
    'use server';
    // TODO: determine if we really need show_id for customers as it requires
    // api changes
    return await getCustomersAction({ page, sorting, show_id: show?.id });
  }

  const customers = await getCustomers({ page, sorting: sort });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customers</CardTitle>
      </CardHeader>

      <CardContent>
        <DataTable
          columns={columns}
          data={customers}
          sort={sort}
          // @ts-expect-error: sort is not defined
          refetch={getCustomers}
          tableId='customers'
        />
      </CardContent>
    </Card>
  );
}
