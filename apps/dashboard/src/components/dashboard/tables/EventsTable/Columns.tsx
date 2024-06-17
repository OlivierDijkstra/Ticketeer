'use client';

import type { ColumnData, Event } from '@repo/lib';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge, BadgeCheck, Eye } from 'lucide-react';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { setEventFeaturedAction } from '@/server/actions/events';
import { revalidate } from '@/server/helpers';

export function columns(_data: ColumnData): ColumnDef<Event>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Name',
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
      accessorKey: 'featured',
      header: 'Featured',
      cell: ({ row }) => {
        const enabled = row.getValue('featured');
        return enabled ? <BadgeCheck className='text-green-500' /> : <Badge />;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        async function handleSetFeatured() {
          await setEventFeaturedAction({
            event_slug: row.original.slug,
          });

          revalidate('events');
        }

        return (
          <div className='flex justify-end gap-2'>
            <Link href={`/dashboard/events/${row.original.slug}`}>
              <Button variant='outline' size='sm'>
                <Eye className='mr-1 !size-3' />
                <span>View</span>
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon'>
                  <span className='sr-only'>Open menu</span>
                  <MoreHorizontal className='size-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  disabled={row.original.featured}
                  onClick={handleSetFeatured}
                  className='flex items-center gap-2'
                >
                  <Badge className='!size-3' />
                  <span>Set Featured</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
