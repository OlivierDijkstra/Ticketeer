'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { createCustomerAction } from '@/server/actions/customers';
import { updateOrderAction } from '@/server/actions/orders';

export default function CreateCustomerForm({
  callback,
}: {
  callback?: () => void;
}) {
  const params = useParams<{
    order: string;
  }>();

  const schema = z.object({
    first_name: z.string().min(1, {
      message: 'First name is required',
    }),
    last_name: z.string().min(1, {
      message: 'Last name is required',
    }),
    email: z.string().email(),
    phone: z.string().optional(),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
    },
  });

  async function onSubmit(data: z.infer<typeof schema>) {
    await toast.promise(
      createCustomerAction({
        data,
      }),
      {
        loading: 'Creating customer...',
        success: async (data) => {
          if (params.order) {
            await toast.promise(
              updateOrderAction({
                order_id: params.order,
                data: {
                  customer_id: data.id,
                },
              }),
              {
                loading: 'Linking customer to order...',
                success: () => {
                  callback && callback();
                  return 'The customer has been successfully created and linked to the order';
                },
                error: 'Failed to link customer to order',
              }
            );
          }
          
          callback && callback();
          return 'The customer has been successfully created';
        },
        error: 'Failed to create customer',
      }
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-2'>
        <div className='grid grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='first_name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>First name</FormLabel>
                <FormControl>
                  <Input placeholder='John' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='last_name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last name</FormLabel>
                <FormControl>
                  <Input placeholder='Doe' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder='john.doe@example.com'
                  type='email'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='phone'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder='+123 456 789' type='tel' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex justify-end'>
          <Button disabled={form.formState.isSubmitting} type='submit'>
            Create
          </Button>
        </div>
      </form>
    </Form>
  );
}
