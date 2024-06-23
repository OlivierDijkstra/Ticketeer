'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { Payment } from '@repo/lib';
import formatMoney from '@repo/lib';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { CurrencyInput } from '@/components/currency-input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { refundPaymentAction } from '@/server/actions/payments';

export default function RefundPaymentForm({
  payment,
  callback,
}: {
  payment: Payment;
  callback?: () => void;
}) {

  const maxAmount = useMemo(() => {
    return (
      parseFloat(payment.amount) -
      (parseFloat(`${payment.amount_refunded}`) || 0)
    );
  }, [payment.amount, payment.amount_refunded]);

  const schema = z.object({
    amount: z.number().min(0).max(maxAmount),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: 0,
    },
  });

  async function onSubmit(data: z.infer<typeof schema>) {
    await toast.promise(
      refundPaymentAction({
        payment_id: payment.id,
        data: {
          amount: data.amount.toString(),
        },
      }),
      {
        loading: 'Refunding payment...',
        success: () => {
          callback && callback();
          return 'Refund requested, it may take some time to fully process.';
        },
        error: 'Failed to refund payment',
      }
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-2'>
        <FormField
          control={form.control}
          name='amount'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <p className='text-muted-foreground text-sm'>
                Maximum amount: {formatMoney(maxAmount)}
              </p>
              <FormControl>
                <CurrencyInput max={maxAmount} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex justify-end'>
          <Button disabled={form.formState.isSubmitting} type='submit'>
            Refund
          </Button>
        </div>
      </form>
    </Form>
  );
}
