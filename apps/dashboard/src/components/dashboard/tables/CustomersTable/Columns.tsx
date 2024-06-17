'use client';

import type { ColumnData, Customer } from '@repo/lib';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import Link from 'next/link';

import SortButton from '@/components/dashboard/tables/SortButton';
import { Button } from '@/components/ui/button';

export function columns(data: ColumnData): ColumnDef<Customer>[] {
  return [
    {
      accessorKey: 'first_name',
      header: () => {
        return (
          <SortButton
            name='first_name'
            onClick={data.onSort}
            sort={data.sorting}
          >
            First Name
          </SortButton>
        );
      },
    },
    {
      accessorKey: 'last_name',
      header: () => {
        return (
          <SortButton
            name='last_name'
            onClick={data.onSort}
            sort={data.sorting}
          >
            Last Name
          </SortButton>
        );
      },
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <div className='flex justify-end gap-2'>
            <Link href={`/dashboard/customers/${row.original.id}`}>
              <Button variant='outline' size='sm'>
                <Eye className='mr-1 !size-3' />
                <span>View</span>
              </Button>
            </Link>
          </div>
        );
      },
    },
  ];
}
