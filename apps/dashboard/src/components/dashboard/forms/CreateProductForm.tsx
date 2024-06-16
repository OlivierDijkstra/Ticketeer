'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'next/navigation';
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
import { createProductAction } from '@/server/actions/products';

export default function CreateProductForm({
  callback,
}: {
  callback?: () => void;
}) {
  const params = useParams<{ show: string }>();

  const schema = z.object({
    name: z
      .string({
        message: 'Product name is required',
      })
      .max(125, {
        message: 'Product name must be at most 125 characters long',
      })
      .min(3, {
        message: 'Product name must be at least 3 characters long',
      }),
    description: z.string().max(255).optional(),
    price: z.number().min(0),
    vat: z.number().min(0).max(100),
    is_upsell: z.boolean().optional(),
    amount: z.number().min(0).optional(),
    enabled: z.boolean().optional(),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      vat: 9,
      is_upsell: false,
      amount: 0,
      enabled: false,
    },
  });

  async function onSubmit(data: z.infer<typeof schema>) {
    if (params.show) {
      Object.assign(data, { show_id: params.show });
    }

    await toast.promise(
      // @ts-expect-error: data is not defined
      createProductAction({
        ...data,
        is_upsell: data.is_upsell || false,
      }),
      {
        loading: 'Creating product...',
        success: () => {
          callback && callback();
          return 'Product created';
        },
        error: 'Failed to create product',
      }
    );
  }

  const [price, setPrice] = useCurrencyInput('0');

  useEffect(() => {
    form.setValue('price', parseFloat(price.replace(/[^\d]/g, '')) / 100 || 0);
  }, [form, price]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-2'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
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
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='is_upsell'
          render={({ field }) => (
            <FormItem>
              <div className='flex items-center gap-2'>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>

                <FormLabel>Upsell</FormLabel>
              </div>
              <FormDescription>
                Upsell products are displayed as additional options to the
                customer.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex justify-between gap-2'>
          <FormField
            control={form.control}
            name='price'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    inputMode='numeric'
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='vat'
            render={({ field: { value, onChange, name } }) => (
              <FormItem>
                <FormLabel>VAT (%)</FormLabel>
                <FormControl>
                  <Input
                    name={name}
                    inputMode='numeric'
                    type='number'
                    value={value.toString()}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <hr className='my-4' />
        </div>

        {params.show && (
          <>
            <hr />

            <FormField
              control={form.control}
              name='amount'
              render={({ field: { value, name, onChange } }) => (
                <FormItem>
                  <FormLabel>Total Available</FormLabel>
                  <FormControl>
                    <Input
                      name={name}
                      type='number'
                      inputMode='numeric'
                      value={value?.toString()}
                      onChange={(e) => onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='enabled'
              render={({ field }) => (
                <FormItem className='flex items-center gap-2'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className='pb-2'>Enabled</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <div className='flex justify-end'>
          <Button disabled={form.formState.isSubmitting} type='submit'>
            Create
          </Button>
        </div>
      </form>
    </Form>
  );
}
