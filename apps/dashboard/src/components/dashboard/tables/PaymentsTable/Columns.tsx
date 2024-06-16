'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

import { Badge } from '@/components/ui/badge';
import { DEFAULT_DATE_FORMAT } from '@/lib/constants';
import formatMoney from '@/lib/utils';
import type { ColumnData, Payment } from '@/types/api';

export function columns(_data: ColumnData): ColumnDef<Payment>[] {
  return [
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        return <Badge>{row.original.status}</Badge>;
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        return <span>{formatMoney(row.original.amount)}</span>;
      },
    },
    {
      accessorKey: 'payment_method',
      header: 'Payment Method',
      cell: ({ row }) => {
        return <span>{row.original.payment_method || 'N/A'}</span>;
      },
    },
    {
      accessorKey: 'refunded_amount',
      header: 'Refunded Amount',
      cell: ({ row }) => {
        return (
          <span>
            {row.original.refunded_amount
              ? formatMoney(row.original.refunded_amount)
              : 'N/A'}
          </span>
        );
      },
    },
    {
      accessorKey: 'paid_at',
      header: 'Paid At',
      cell: ({ row }) => {
        return (
          <span>
            {row.original.paid_at
              ? format(new Date(row.original.paid_at), DEFAULT_DATE_FORMAT)
              : 'N/A'}
          </span>
        );
      },
    },
    {
      accessorKey: 'refunded_at',
      header: 'Refunded At',
      cell: ({ row }) => {
        return (
          <span>
            {row.original.refunded_at
              ? format(new Date(row.original.refunded_at), DEFAULT_DATE_FORMAT)
              : 'N/A'}
          </span>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Date',
      cell: ({ row }) => {
        return (
          <span>
            {format(new Date(row.original.created_at), DEFAULT_DATE_FORMAT)}
          </span>
        );
      },
    },
  ];
}
