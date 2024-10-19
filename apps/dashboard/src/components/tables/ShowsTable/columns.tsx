'use client';

import type { ColumnData, Show } from '@repo/lib';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import {
  ArrowRight,
  ArrowUpDown,
  Badge,
  BadgeCheck,
  Eye,
  MoreHorizontalIcon,
  TrashIcon,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DEFAULT_DATE_FORMAT } from '@/lib/constants';
import { deleteShowAction } from '@/server/actions/shows';
import { revalidate } from '@/server/helpers';

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

        async function deleteShow() {
          await toast.promise(deleteShowAction({ show_id: row.original.id }), {
            loading: 'Deleting show...',
            success: () => {
              revalidate('shows');
              return 'Show deleted';
            },
          });
        }

        return (
          <div className='flex justify-end gap-2'>
            <AlertDialog>
              <Link href={`/dashboard/events/${slug}/${row.original.id}`}>
                <Button variant='outline' size='sm'>
                  <Eye className='mr-1 !size-3' />
                  <span>View</span>
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='icon'>
                    <span className='sr-only'>Open menu</span>
                    <MoreHorizontalIcon className='size-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem className='flex items-center gap-2'>
                      <TrashIcon className='!size-3' />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                </DropdownMenuContent>
              </DropdownMenu>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteShow}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];
}
