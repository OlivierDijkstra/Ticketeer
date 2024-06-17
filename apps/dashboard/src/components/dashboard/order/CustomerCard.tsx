import { Eye } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { Order } from '@/types/api';

export default function CustomerCard({ order }: { order: Order }) {
  return (
    <Card className='overflow-hidden'>
      <CardHeader className='flex flex-row justify-between bg-muted/50 sm:items-center'>
        <div>
          <h1 className='font-semibold tracking-tight'>Customer details</h1>
        </div>

        {
          order.customer && (
            <div>
              <Link href={`/dashboard/customers/${order.customer?.id}`}>
                <Button size='sm' variant='outline'>
                  <Eye className='mr-2 !size-3' /> View customer
                </Button>
              </Link>
            </div>
          )
        }
      </CardHeader>

      <CardContent className='mt-4 text-sm'>
        <ul className='grid gap-3'>
          <li className='flex items-center justify-between'>
            <span className='text-muted-foreground'>Name</span>
            {
              order.customer ?
                (<span>{`${order.customer?.first_name} ${order.customer?.last_name}`}</span>)
                : (<span>-</span>)
            }
          </li>
          <li className='flex items-center justify-between'>
            <span className='text-muted-foreground'>Email</span>
            <span>{order.customer?.email}</span>
          </li>

          <li className='flex items-center justify-between'>
            <span className='text-muted-foreground'>Phone</span>
            <span>{order.customer?.phone || 'N/A'}</span>
          </li>

          <div className='font-medium'>Address</div>

          <li className='flex items-center justify-between'>
            <span className='text-muted-foreground'>Street</span>
            <span>
              {`${order.customer?.address.street}, ${order.customer?.address.street2 || ''}`}
            </span>
          </li>

          <li className='flex items-center justify-between'>
            <span className='text-muted-foreground'>City</span>
            <span>{order.customer?.address.city}</span>
          </li>

          <li className='flex items-center justify-between'>
            <span className='text-muted-foreground'>Postal code</span>
            <span>{order.customer?.address.postal_code}</span>
          </li>

          <li className='flex items-center justify-between'>
            <span className='text-muted-foreground'>Province</span>
            <span>{order.customer?.address.province}</span>
          </li>

          <li className='flex items-center justify-between'>
            <span className='text-muted-foreground'>Country</span>
            <span>{order.customer?.address.country}</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}
