'use client';

import type { Order } from '@repo/lib';
import { Euro } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import Spinner from '@/components/spinner';
import { Button } from '@/components/ui/button';
import { createPaymentAction } from '@/server/actions/orders';
import { revalidate } from '@/server/helpers';

interface Props extends React.HTMLAttributes<HTMLButtonElement> {
  order: Order;
}

export default function CreatePayment(props: Props) {
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);

  async function handleCreatePayment() {
    setLoading(true);

    toast.promise(
      createPaymentAction({
        order_id: props.order.id,
        data: {
          redirect_url: window.location.href,
        },
      }),
      {
        loading: 'Creating payment...',
        success: (data: { payment_url: string }) => {
          setLoading(false);
          setDisabled(true);
          setTimeout(() => {
            setDisabled(false);
          }, 2000);

          revalidate('payments');

          return (
            <p className='font-medium'>
              Payment created.{' '}
              <a
                className='text-primary-500 underline'
                href={data.payment_url}
                target='_blank'
                rel='noreferrer'
              >
                Click here to open
              </a>
            </p>
          );
        },
        error: () => {
          setLoading(false);
          return 'Failed to create payment';
        },
      }
    );
  }

  return (
    <Button
      onClick={handleCreatePayment}
      {...props}
      size='sm'
      variant='outline'
      disabled={props.order.status === 'paid' || loading || disabled}
    >
      {loading ? (
        <Spinner size='sm' />
      ) : (
        <>
          <Euro className='mr-2 !size-3' />
          Create Payment
        </>
      )}
    </Button>
  );
}
