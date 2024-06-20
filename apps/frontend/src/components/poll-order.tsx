'use client';

import { Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { fetchJson } from '@/lib/fetch';

export default function PollOrder({
  order_id,
  show_id,
}: {
  order_id: string;
  show_id: string;
}) {
  const router = useRouter();

  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const response = await fetchJson<{
        is_paid: boolean;
      }>(`/api/orders/${order_id}/is-paid`);

      setIsPaid(response?.is_paid);

      if (response?.is_paid) {
        clearInterval(interval);
        router.push(`/order-confirmed?order_id=${order_id}&show_id=${show_id}`);
      }
    };

    const interval = setInterval(checkPaymentStatus, 4500);

    return () => clearInterval(interval);
  }, [order_id, router, show_id]);

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-background'>
      <div className='w-full max-w-md rounded-lg bg-card px-6 py-8 shadow-lg'>
        <h1 className='mb-4 text-center text-2xl font-bold'>
          Checking Order Status
        </h1>
        <p className='mb-6 text-center text-muted-foreground'>
          Thank you for your recent purchase! We&apos;re currently checking the
          status of your order. Please wait a moment while we update you.
        </p>
        <div className='mb-6 flex items-center justify-center'>
          <div className='h-8 w-8 animate-spin text-primary' />

          <Loader className='animate-spin text-muted-foreground' />
        </div>
        <div className='rounded-md bg-muted p-4'>
          <div className='flex items-center justify-between'>
            <span className='text-muted-foreground'>Order Status:</span>
            <span className='font-medium text-primary'>
              {isPaid ? 'Paid' : 'Pending'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
