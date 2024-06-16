'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ArrowRight, ArrowUpDown, Badge, BadgeCheck, Eye } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { DEFAULT_DATE_FORMAT } from '@/lib/constants';
import type { ColumnData, Show } from '@/types/api';

export function columns(data: ColumnData): ColumnDef<Show>[] {
  return [
    {
      accessorKey: 'start',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Start
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <span className='flex items-center gap-2'>
            {format(new Date(row.original.start), DEFAULT_DATE_FORMAT)}
            <ArrowRight />
          </span>
        );
      },
    },
    {
      accessorKey: 'end',
      header: 'End',
      cell: ({ row }) => {
        return format(new Date(row.original.end), DEFAULT_DATE_FORMAT);
      },
    },
    {
      accessorKey: 'enabled',
      header: 'Enabled',
      cell: ({ row }) => {
        const enabled = row.getValue('enabled');
        return enabled ? <BadgeCheck className='text-green-500' /> : <Badge />;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const slug = data.params.event;

        return (
          <div className='flex justify-end gap-2'>
            <Link href={`/dashboard/events/${slug}/${row.original.id}`}>
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
