import type { PaginatedResponse, Product, Show } from '@repo/lib';
import { Link, Plus } from 'lucide-react';

import CreateProductDialog from '@/components/dialogs/create-product-dialog';
import LinkProductDialog from '@/components/dialogs/link-product-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { getProductsAction } from '@/server/actions/products';

import { columns } from './columns';

export default async function ProductsTable({
  show,
  page,
  sort,
}: {
  show?: Show;
  page?: string;
  sort?: { id: string; desc: boolean };
}) {
  async function getProducts({
    page,
    sorting,
  }: {
    page?: string;
    sorting?: { id: string; desc: boolean };
  }) {
    'use server';
    return (await getProductsAction({
      page: page || '1',
      show_id: show?.id,
      sorting,
    })) as PaginatedResponse<Product>;
  }

  const products = await getProducts({ page, sorting: sort });

  return (
    <Card>
      <CardHeader className='flex-row items-center justify-between'>
        <CardTitle>Products</CardTitle>

        <div className='flex items-center justify-between gap-2'>
          {show && (
            <LinkProductDialog>
              <Button variant='secondary'>
                <Link className='mr-2 size-3' />
                <span>Link Product</span>
              </Button>
            </LinkProductDialog>
          )}
          <CreateProductDialog>
            <Button>
              <Plus className='mr-2 size-3' />
              <span>Add Product</span>
            </Button>
          </CreateProductDialog>
        </div>
      </CardHeader>

      <CardContent>
        <DataTable
          columns={columns}
          data={products}
          sort={sort}
          // @ts-expect-error: sort is not defined
          refetch={getProducts}
          tableId='products'
        />
      </CardContent>
    </Card>
  );
}
