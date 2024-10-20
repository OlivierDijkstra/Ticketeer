'use client';

import type { ColumnData, Product } from '@repo/lib';
import formatMoney, { createUrl } from '@repo/lib';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge, BadgeCheck, Eye, Pencil, Trash, Unlink } from 'lucide-react';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import EditProductShowPivotDialog from '@/components/dialogs/edit-product-show-pivot-dialog.tsx';
import TableSortButton from '@/components/tables/table-sort-button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useConfig } from '@/lib/hooks';
import { deleteProductAction } from '@/server/actions/products';
import {
  unlinkProductFromShowAction,
  updateProductShowPivotAction,
} from '@/server/actions/shows';
import { revalidate } from '@/server/helpers';

export function columns(data: ColumnData): ColumnDef<Product>[] {
  const baseColumns: ColumnDef<Product>[] = [
    {
      accessorKey: 'name',
      header: () => {
        return (
          <TableSortButton
            name='name'
            onClick={data.onSort}
            sort={data.sorting}
          >
            Name
          </TableSortButton>
        );
      },
    },
    {
      accessorKey: 'price',
      header: data.params.show ? 'Base Price' : 'Price',
      cell: ({ row }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const { config } = useConfig();

        return formatMoney(
          row.original.price,
          config.APP_LOCALE,
          config.APP_CURRENCY
        );
      },
    },
    {
      accessorKey: 'vat',
      header: 'VAT',
      cell: ({ row }) => {
        return `${row.original.vat}%`;
      },
    },
    {
      accessorKey: 'is_upsell',
      header: 'Upsell',
      cell: ({ row }) => {
        return row.original.is_upsell ? (
          <BadgeCheck className='text-green-500' />
        ) : (
          <Badge />
        );
      },
    },
  ];

  if (data.params.show) {
    const showColumns: ColumnDef<Product>[] = [
      {
        accessorKey: 'pivot.amount',
        header: 'Amount',
      },
      {
        accessorKey: 'pivot.stock',
        header: 'Stock',
        cell: ({ row }) => {
          if (!row.original.pivot?.stock || row.original.pivot?.stock === 0) {
            return '-';
          }

          return row.original.pivot?.stock;
        },
      },
      {
        accessorKey: 'pivot.adjusted_price',
        header: 'Adjusted price',
        cell: ({ row }) => {
          if (
            !row.original.pivot?.adjusted_price ||
            row.original.pivot?.adjusted_price === '0.00'
          ) {
            return '-';
          }

          // eslint-disable-next-line react-hooks/rules-of-hooks
          const { config } = useConfig();

          return formatMoney(
            row.original.pivot?.adjusted_price,
            config.APP_LOCALE,
            config.APP_CURRENCY
          );
        },
      },
    ];

    const enabledColumn: ColumnDef<Product> = {
      accessorKey: 'pivot.enabled',
      header: 'Enabled',
      cell: ({ row }) => {
        const enabled = row.original.pivot?.enabled ?? false;
        return enabled ? <BadgeCheck className='text-green-500' /> : <Badge />;
      },
    };

    baseColumns.splice(1, 0, ...showColumns);
    baseColumns.push(enabledColumn);
  }

  const actionColumn: ColumnDef<Product> = {
    id: 'actions',
    cell: ({ row }) => {
      const params = data.params;

      async function detachProduct() {
        toast.promise(
          unlinkProductFromShowAction({
            show_id: params.show as number,
            product_id: row.original.id,
          }),
          {
            loading: 'Detaching product...',
            success: async () => {
              await revalidate('products');
              return 'Product detached';
            },
            error: 'Failed to detach product',
          }
        );
      }

      async function deleteProduct() {
        await toast.promise(deleteProductAction(row.original.id), {
          loading: 'Deleting product...',
          success: () => {
            revalidate('products');
            return 'Product deleted';
          },
          error: 'Failed to delete product',
        });
      }

      async function toggleEnableProduct() {
        await toast.promise(
          updateProductShowPivotAction({
            show_id: params.show as number,
            product_id: row.original.id,
            data: {
              enabled: !row.original.pivot?.enabled,
            },
          }),
          {
            loading: 'Toggling product...',
            success: () => {
              revalidate('products');

              const enabled = row.original.pivot?.enabled ?? false;
              return `Product ${enabled ? 'disabled' : 'enabled'}`;
            },
            error: 'Failed to toggle product',
          }
        );
      }

      const link = createUrl(`/dashboard/products/${row.original.id}`, {
        show_id: params.show as string,
      });

      return (
        <div className='flex justify-end gap-2'>
          <Link href={link}>
            <Button variant='outline' size='sm'>
              <Eye className='mr-1 !size-3' />
              <span>View</span>
            </Button>
          </Link>

          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon'>
                  <span className='sr-only'>Open menu</span>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>

                {!!params.show && (
                  <>
                    <EditProductShowPivotDialog product={row.original}>
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className='flex items-center gap-2'
                      >
                        <Pencil className='!size-3' />
                        <span>Edit Product</span>
                      </DropdownMenuItem>
                    </EditProductShowPivotDialog>

                    <DropdownMenuItem
                      className='flex items-center gap-2'
                      onClick={toggleEnableProduct}
                    >
                      {row.original.pivot?.enabled ? (
                        <>
                          <Badge className='!size-3' />
                          <span>Disable</span>
                        </>
                      ) : (
                        <>
                          <BadgeCheck className='!size-3' />
                          <span>Enable</span>
                        </>
                      )}
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                  </>
                )}

                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className='flex items-center gap-2'>
                    {params.show ? (
                      <>
                        <Unlink className='!size-3' />
                        <span>Detach from show</span>
                      </>
                    ) : (
                      <>
                        <Trash className='!size-3' />
                        <span>Delete</span>
                      </>
                    )}
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  {params.show
                    ? 'This will detach the product from the show, any changes to adjusted price or amount will be lost.'
                    : 'This action cannot be undone.'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={params.show ? detachProduct : deleteProduct}
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    },
  };

  return [...baseColumns, actionColumn];
}
