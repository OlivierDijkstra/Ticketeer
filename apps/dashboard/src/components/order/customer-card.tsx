'use client';

import type { Customer } from '@repo/lib';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function CustomerCard({ customer }: { customer?: Customer }) {
  const params = useParams<{
    customer: string;
  }>();

  return (
    <Card className='overflow-hidden'>
      <CardHeader className='flex flex-row justify-between bg-muted/50 sm:items-center'>
        <div>
          <h1 className='font-semibold tracking-tight'>Customer details</h1>
        </div>

        {customer && !params.customer && (
          <div>
            <Link href={`/dashboard/customers/${customer?.id}`}>
              <Button size='sm' variant='outline'>
                <Eye className='mr-2 !size-3' /> View customer
              </Button>
            </Link>
          </div>
        )}
      </CardHeader>

      <CardContent className='mt-4 text-sm'>
        <ul className='grid gap-3'>
          <li className='flex items-center justify-between'>
            <span className='text-muted-foreground'>Name</span>
            {customer ? (
              <span>{`${customer?.first_name} ${customer?.last_name}`}</span>
            ) : (
              <span>-</span>
            )}
          </li>
          <li className='flex items-center justify-between'>
            <span className='text-muted-foreground'>Email</span>
            <span>{customer?.email}</span>
          </li>

          <li className='flex items-center justify-between'>
            <span className='text-muted-foreground'>Phone</span>
            <span>{customer?.phone || 'N/A'}</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}
