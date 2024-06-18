'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCurrencyInput } from '@/lib/hooks';
import { createEventAction } from '@/server/actions/events';

export default function CreateEventForm({
  callback,
}: {
  callback?: () => void;
}) {
  const schema = z.object({
    name: z
      .string({
        message: 'Name is required',
      })
      .max(125, {
        message: 'Name must be at most 125 characters long',
      })
      .min(3, {
        message: 'Name must be at least 3 characters long',
      }),
    description: z
      .string()
      .max(255, {
        message: 'Description must be at most 255 characters long',
      })
      .optional(),
    description_short: z
      .string()
      .max(100, {
        message: 'Short description must be at most 100 characters long',
      })
      .optional(),
    enabled: z.boolean().optional(),
    service_price: z.number().min(0),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      description_short: '',
      enabled: false,
      service_price: 0,
    },
  });

  async function onSubmit(data: z.infer<typeof schema>) {
    const slug = data.name.toLowerCase().replace(/ /g, '-');

    await toast.promise(
      createEventAction({
        data: {
          ...data,
          description: data.description || '',
          description_short: data.description_short || '',
          enabled: data.enabled || false,
          slug,
          featured: false,
        },
      }),
      {
        loading: 'Creating event...',
        success: () => {
          callback && callback();
          return 'The event has been successfully created';
        },
        error: 'Failed to create event',
      }
    );
  }

  const [servicePrice, setServicePrice] = useCurrencyInput('0');

  useEffect(() => {
    form.setValue(
      'service_price',
      parseFloat(servicePrice.replace(/[^\d]/g, '')) / 100 || 0
    );
  }, [form, servicePrice]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-2'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                The name of the event. This will be displayed on the website.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormDescription>
                A short description of the event. This will be displayed on the
                website.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='description_short'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormDescription>
                A very short description of the event. This will be displayed on the
                website.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='service_price'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Price</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  inputMode='numeric'
                  value={servicePrice}
                  onChange={(e) => setServicePrice(e.target.value)}
                />
              </FormControl>
              <FormDescription>
                Service price is what the customers will pay additonally to the
                total cost of the order.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <hr className='my-4 space-y-4' />
        </div>

        <FormField
          control={form.control}
          name='enabled'
          render={({ field }) => (
            <FormItem>
              <div className='flex items-center gap-2'>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Enabled</FormLabel>
              </div>
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
