'use client';

import type { Order } from '@repo/lib';
import { MoreHorizontal, TicketIcon } from 'lucide-react';
import { toast } from 'sonner';

import TicketItem from '@/components/order/ticket-item';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { notifyTickets } from '@/server/actions/notifications';

export default function TicketsCard({ order }: { order: Order }) {
  async function sendTicketNotification() {
    await toast.promise(notifyTickets({ order_id: order.id }), {
      loading: 'Sending...',
      success: 'Tickets notification sent',
      error: 'Failed to send tickets notification',
    });
  }

  return (
    <Card className='overflow-hidden'>
      <CardHeader className='flex flex-row justify-between bg-muted/50 sm:items-center'>
        <h1 className='font-semibold tracking-tight'>Tickets</h1>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              onClick={sendTicketNotification}
              size="sm"
              variant='outline'
              className='shrink-0'
            >
              <MoreHorizontal className='!size-3 mr-2' /> Options
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={sendTicketNotification}>
              <TicketIcon className='!size-3 mr-2' /> Send Tickets
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className='mt-4 text-sm'>
        <ul className='space-y-2'>
          {order.tickets?.map((ticket) => (
            <TicketItem key={ticket.id} ticket={ticket} show={order.show} />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
