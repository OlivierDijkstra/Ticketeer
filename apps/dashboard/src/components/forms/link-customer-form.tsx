'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { Customer } from '@repo/lib';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useDebounceCallback } from 'usehooks-ts';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import Combobox from '@/components/ui/combobox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { getCustomersAction } from '@/server/actions/customers';
import { updateOrderAction } from '@/server/actions/orders';

export default function LinkCustomerForm({
  callback,
}: {
  callback?: () => void;
}) {
  const params = useParams<{ order: string }>();

  const schema = z.object({
    customer: z.string().min(1, {
      message: 'Customer is required',
    }),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      customer: '',
    },
  });

  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [customerSelectOpen, setCustomerSelectOpen] = useState<boolean>(false);
  const [customerSearch, setCustomerSearch] = useState<string>('');

  const debouncedCustomerSearch = useDebounceCallback(setCustomerSearch, 500, {
    trailing: true,
  });

  const fetchCustomers = useCallback(async () => {
    const res = await getCustomersAction({ search: customerSearch || '' });
    setCustomers(res as unknown as Customer[]);
  }, [customerSearch]);

  const mappedCustomers = useMemo(
    () =>
      customers?.map((customer) => ({
        value: customer.id,
        label: `${customer.first_name} ${customer.last_name}`,
        subtitle: customer.email,
      })),
    [customers]
  );

  useEffect(() => {
    if (customerSearch || (customerSelectOpen && !customers)) {
      fetchCustomers();
    }
  }, [customerSearch, customerSelectOpen, customers, fetchCustomers]);

  async function onSubmit(data: z.infer<typeof schema>) {
    await toast.promise(
      updateOrderAction({
        order_id: params.order,
        data: {
          customer_id: data.customer,
        },
      }),
      {
        loading: 'Linking customer to order...',
        success: () => {
          callback && callback();
          return 'Customer linked to order';
        },
        error: (error) => {
          return `Failed to link customer to order: ${error.message}`;
        },
      }
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-2'>
        <FormField
          control={form.control}
          name='customer'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer</FormLabel>
              <FormControl>
                <Combobox
                  async
                  required
                  className='w-full'
                  placeholder='Select customer...'
                  name='customer'
                  items={mappedCustomers}
                  open={customerSelectOpen}
                  onOpenChange={setCustomerSelectOpen}
                  loading={!mappedCustomers}
                  onValueChange={(value) => field.onChange(value)}
                  onSearch={debouncedCustomerSearch}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex justify-end'>
          <Button disabled={form.formState.isSubmitting} type='submit'>
            Link
          </Button>
        </div>
      </form>
    </Form>
  );
}
