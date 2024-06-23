'use client';

import type { Order } from '@repo/lib';
import formatMoney, { cn } from '@repo/lib';
import { format } from 'date-fns';
import { useState } from 'react';

import CopyToClipboard from '@/components/copy-to-clipboard';
import EditableField from '@/components/editable-field';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DEFAULT_PRETTY_DATE_FORMAT } from '@/lib/constants';
import { handleFieldUpdate } from '@/lib/utils';
import { updateOrderAction } from '@/server/actions/orders';

export default function OrderCard({ order }: { order: Order }) {
  const [description, setDescription] = useState(order.description);
  const [loading, setLoading] = useState(false);

  async function handleDescriptionChange(value: string | number | null) {
    await handleFieldUpdate<Order, typeof updateOrderAction>({
      updateAction: updateOrderAction,
      data: {
        order_id: order.id,
        data: {
          description: value ? `${value}` : null,
        },
      },
      setLoading,
      setData: (data: Order) => {
        setDescription(data.description);
      },
      successMessage: 'Order updated successfully',
      errorMessage: 'Failed to update order',
    });
  }

  return (
    <Card className='overflow-hidden'>
      <CardHeader className='bg-muted/50'>
        <Badge className='mb-1 max-w-fit'>{order.status}</Badge>

        <CopyToClipboard value={order.order_number}>
          <h1 className='line-clamp-1 group min-w-0 gap-2 font-semibold tracking-tight'>
            {order.order_number}
          </h1>
        </CopyToClipboard>

        <p className='text-xs text-muted-foreground'>
          {`Date: ${format(new Date(order.created_at), DEFAULT_PRETTY_DATE_FORMAT)}`}
        </p>
      </CardHeader>

      <CardContent className='mt-4 text-sm'>
        <div className='mb-2 font-medium'>Description</div>

        <EditableField
          value={description as string}
          onChange={handleDescriptionChange}
          className={cn([
            'text-muted-foreground transition-opacity',
            {
              'pointer-events-none opacity-50': loading,
            },
          ])}
          tooltipText='Edit order description'
          placeholder='-'
          minLength={0}
        />

        <div className='mb-2 font-medium'>Order details</div>

        <ul className='grid gap-3'>
          {order.products.map((product) => (
            <li key={product.id} className='flex items-center justify-between'>
              <span className='text-muted-foreground'>
                {product.name} x <span>{product.pivot?.amount}</span>
              </span>

              <div className='flex flex-col'>
                {product.pivot?.adjusted_price && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Badge className='h-3 w-10 self-end px-0.5 text-[0.5rem]'>
                          Adjusted
                        </Badge>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className='flex flex-wrap gap-1 text-xs font-normal'>
                        <span>
                          The price was adjusted from the default price of
                        </span>

                        <span>{formatMoney(product.price)}</span>
                        <span>to</span>

                        <span>
                          {formatMoney(product.pivot?.adjusted_price)}
                        </span>
                      </p>
                    </TooltipContent>
                  </Tooltip>
                )}

                <span>
                  {formatMoney(
                    product.pivot?.adjusted_price || product.pivot?.price || 0
                  )}
                </span>
              </div>
            </li>
          ))}
        </ul>

        <div
          data-orientation='horizontal'
          role='none'
          className='my-4 h-[1px] w-full shrink-0 bg-border'
        />

        <ul className='grid gap-3'>
          <li className='flex items-center justify-between'>
            <span className='text-muted-foreground'>Subtotal</span>
            <span>
              {formatMoney(parseFloat(order.total) - parseFloat(order.service_fee))}
            </span>
          </li>
          <li className='flex items-center justify-between'>
            <span className='text-muted-foreground'>Service Fee</span>
            <span>{formatMoney(order.service_fee)}</span>
          </li>
          <li className='flex items-center justify-between font-semibold'>
            <span className='text-muted-foreground'>Total</span>
            <span>{formatMoney(order.total)}</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}
