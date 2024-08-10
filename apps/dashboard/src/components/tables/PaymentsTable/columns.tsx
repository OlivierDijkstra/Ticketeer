'use client';

import type { ColumnData, Payment } from '@repo/lib';
import formatMoney from '@repo/lib';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import {
  CopyIcon,
  ExternalLinkIcon,
  MoreHorizontal,
  TicketSlashIcon,
  TimerIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import RefundPaymentDialog from '@/components/dialogs/refund-payment-dialog';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DEFAULT_DATE_FORMAT } from '@/lib/constants';
import { useConfig } from '@/lib/hooks';
import { refundPaymentAction } from '@/server/actions/payments';
import { revalidate } from '@/server/helpers';

export function columns(_data: ColumnData): ColumnDef<Payment>[] {
  return [
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        if (row.original.status === 'pending_refund') {
          return (
            <Tooltip>
              <TooltipTrigger>
                <Badge>
                  <TimerIcon className='mr-2 !size-2.5' strokeWidth={3} />
                  <span>{row.original.status}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                This payment is currently being refunded. It may take a few
                minutes to complete.
              </TooltipContent>
            </Tooltip>
          );
        }

        return <Badge>{row.original.status}</Badge>;
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const { config } = useConfig();

        return (
          <span>
            {formatMoney(row.original.amount, config.APP_LOCALE, config.APP_CURRENCY)}
          </span>
        );
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
      accessorKey: 'amount_refunded',
      header: 'Amount Refunded',
      cell: ({ row }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const { config } = useConfig();

        return (
          <span>
            {row.original.amount_refunded
              ? formatMoney(
                  row.original.amount_refunded,
                  config.APP_LOCALE,
                  config.APP_CURRENCY
                )
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
    {
      id: 'actions',
      cell: ({ row }) => {
        const payment = row.original;

        function createFullRefund() {
          toast.promise(
            refundPaymentAction({
              payment_id: payment.id,
              data: {
                amount: payment.amount,
              },
            }),
            {
              loading: 'Refunding payment...',
              success: async () => {
                await revalidate('payments');
                return 'Payment refunded';
              },
              error: 'Failed to refund payment',
            }
          );
        }

        function handleCopyPaymentId() {
          navigator.clipboard.writeText(payment.transaction_id);
          toast.success('Payment ID copied to clipboard');
        }

        return (
          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='h-8 w-8 p-0'>
                  <span className='sr-only'>Open menu</span>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleCopyPaymentId}>
                  <CopyIcon className='mr-2' />
                  Copy payment ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    window.open(payment.payment_url as string, '_blank');
                  }}
                  disabled={payment.status !== 'open'}
                >
                  <ExternalLinkIcon className='mr-2' />
                  Open payment
                </DropdownMenuItem>
                <RefundPaymentDialog payment={payment}>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    disabled={
                      [
                        'open',
                        'cancelled',
                        'pending_refund',
                        'refunded',
                        'failed',
                        'chargeback',
                      ].includes(payment.status) || !payment.payment_method
                    }
                  >
                    <TicketSlashIcon className='mr-2' />
                    Partial refund
                  </DropdownMenuItem>
                </RefundPaymentDialog>

                <DropdownMenuSeparator />

                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    disabled={
                      [
                        'open',
                        'cancelled',
                        'pending_refund',
                        'partially_refunded',
                        'failed',
                        'chargeback',
                      ].includes(payment.status) || !payment.payment_method
                    }
                  >
                    <TicketSlashIcon className='mr-2' />
                    Full refund
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This customer will be fully refunded for this order, tickets
                  invalidated and stock will be increased.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={createFullRefund}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        );
      },
    },
  ];
}
