import type { Show } from '@repo/lib';
import { PlusIcon } from 'lucide-react';

import CreateCustomerDialog from '@/components/dialogs/create-customer-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { getCustomersAction } from '@/server/actions/customers';

import { columns } from './columns';

export default async function CustomersTable({
  show,
  page,
  sort,
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
    return await getCustomersAction({ page, sorting, show_id: show?.id });
  }

  const customers = await getCustomers({ page, sorting: sort });

  return (
    <Card>
      <CardHeader className='flex-row items-center justify-between gap-2'>
        <CardTitle>Customers</CardTitle>

        <CreateCustomerDialog>
          <Button>
            <PlusIcon className='mr-2' /> Add Customer
          </Button>
        </CreateCustomerDialog>
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
