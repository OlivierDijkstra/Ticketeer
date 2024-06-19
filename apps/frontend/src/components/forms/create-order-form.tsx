'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { Product, Show } from '@repo/lib';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import ProductSelection from '@/components/product-selection';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { createOrder } from '@/server/actions/orders';

const formSchema = z.object({
  show_id: z.number(),
  customer: z
    .object({
      email: z.string().email(),
      first_name: z.string(),
      last_name: z.string(),
      street: z.string(),
      street2: z.string().optional(),
      city: z.string(),
      postal_code: z.string(),
      state: z.string(),
      phone: z.string().optional(),
    })
    .optional(),
  products: z
    .array(
      z.object({
        id: z.number(),
        amount: z.number().min(1),
        price: z.string().optional(),
      })
    )
    .min(1, {
      message: 'You are required to have at least one product.',
    }),
  note: z.string().optional(),
  tos: z.boolean().refine((data) => data, {
    message: 'You must agree to the terms of service.',
  }),
});

export default function CreateOrderForm({
  products,
  show,
}: {
  products: Product[];
  show: Show;
}) {
  const [productQuantities, setProductQuantities] = useState(
    products
      .sort((a, b) => Number(a.is_upsell) - Number(b.is_upsell))
      .map((product) => ({
        ...product,
        amount: 0,
      }))
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      show_id: show.id,
      products: [],
      customer: {
        email: 'john@example.com',
        first_name: 'John',
        last_name: 'Doe',
        street: 'Street 1',
        street2: '',
        city: 'Amsterdam',
        postal_code: '1234AB',
        state: 'North Holland',
        phone: '+31612345678',
      },
    },
  });

  const updateProductQuantity = (id: number, delta: number) => {
    setProductQuantities((prevQuantities) =>
      prevQuantities.map((product) =>
        product.id === id
          ? { ...product, amount: Math.max(0, product.amount + delta) }
          : product
      )
    );
  };

  useEffect(() => {
    const productsWithAmounts = productQuantities.filter(
      (product) => product.amount > 0
    );

    if (productsWithAmounts.length > 0) {
      form.setValue('products', productsWithAmounts, {
        shouldDirty: true,
      });
    } else if (form.getValues('products').length) {
      form.setValue('products', [], {
        shouldDirty: true,
      });
    }
  }, [productQuantities, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const order = await createOrder({
        ...values,
        redirect_url: `${window.location.origin}/poll`,
      });

      window.location.replace(order.payment_url);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex flex-col gap-2'
      >
        <div className='space-y-2'>
          {productQuantities.map((product) => (
            <ProductSelection
              key={product.id}
              product={product}
              onAdd={() => {
                updateProductQuantity(product.id, 1);
              }}
              onRemove={() => {
                updateProductQuantity(product.id, -1);
              }}
            />
          ))}

          {form.formState.errors.products && (
            <FormMessage>{form.formState.errors.products.message}</FormMessage>
          )}
        </div>

        <div className='grid grid-cols-2 gap-2'>
          <FormField
            control={form.control}
            name='customer.first_name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>First name</FormLabel>
                <FormControl>
                  <Input placeholder='shadcn' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='customer.last_name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last name</FormLabel>
                <FormControl>
                  <Input placeholder='shadcn' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='customer.email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type='email'
                  placeholder='shadcn@example.com'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid grid-cols-2 gap-2'>
          <FormField
            control={form.control}
            name='customer.street'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street</FormLabel>
                <FormControl>
                  <Input placeholder='123 Main St' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='customer.street2'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street 2</FormLabel>
                <FormControl>
                  <Input placeholder='Apt, Suite, etc. (optional)' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='grid grid-cols-2 gap-2'>
          <FormField
            control={form.control}
            name='customer.city'
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder='City' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='customer.postal_code'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code</FormLabel>
                <FormControl>
                  <Input placeholder='Postal Code' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='customer.state'
          render={({ field }) => (
            <FormItem>
              <FormLabel>state</FormLabel>
              <FormControl>
                <Input placeholder='state' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='customer.phone'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder='Phone (optional)' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name='tos'
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <div className='items-top flex space-x-2'>
                <Checkbox
                  name={field.name}
                  checked={field.value || false}
                  onCheckedChange={field.onChange}
                />

                <FormLabel>I agree to the terms of service</FormLabel>
              </div>

              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          disabled={form.formState.isSubmitting}
          type='submit'
          className='mt-2 self-end'
        >
          Submit
        </Button>
      </form>
    </Form>
  );
}
