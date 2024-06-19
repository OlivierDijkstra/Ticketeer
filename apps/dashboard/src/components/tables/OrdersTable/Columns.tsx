'use client';

import type { ColumnData, Order } from '@repo/lib';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DEFAULT_DATE_FORMAT } from '@/lib/constants';

export function columns(_data: ColumnData): ColumnDef<Order>[] {
  const baseColumns: ColumnDef<Order>[] = [
    {
      accessorKey: 'customer',
      header: 'Customer',
      cell: ({ row }) => {
        if (!row.original.customer) {
          return '-';
        }

        return `${row.original.customer?.first_name} ${row.original.customer?.last_name}`;
      },
    },
    {
      accessorKey: 'event',
      header: 'Event',
      cell: ({ row }) => {
        return row.original.event.name;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        return <Badge>{row.original.status}</Badge>;
      },
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row }) => {
        if (!row.original.total) return 'Free';

        return Intl.NumberFormat('nl-NL', {
          style: 'currency',
          currency: 'EUR',
        }).format(row.original.total);
      },
    },
    {
      accessorKey: 'paid_at',
      header: 'Paid At',
      cell: ({ row }) => {
        if (!row.original.paid_at) return '-';

        return format(new Date(row.original.paid_at), DEFAULT_DATE_FORMAT);
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Created At',
      cell: ({ row }) => {
        return format(new Date(row.original.created_at), DEFAULT_DATE_FORMAT);
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <div className='flex justify-end gap-2'>
            <Link href={`/dashboard/orders/${row.original.id}`}>
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
  return [...baseColumns];
}
