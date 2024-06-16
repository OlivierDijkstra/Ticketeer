'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useDebounceCallback } from 'usehooks-ts';
import { z } from 'zod';

import OrderProductField from '@/components/dashboard/order/OrderProductField';
import { Button } from '@/components/ui/button';
import Combobox from '@/components/ui/combobox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { DEFAULT_DATE_FORMAT } from '@/lib/constants';
import { getCustomersAction } from '@/server/actions/customers';
import { createOrdersAction } from '@/server/actions/orders';
import { getProductsAction } from '@/server/actions/products';
import { getShowsAction } from '@/server/actions/shows';
import type { Customer, Product, Show } from '@/types/api';

export default function CreateOrderForm({
  callback,
}: {
  callback?: () => void;
}) {
  const params = useParams<{ show: string }>();

  const schema = z
    .object({
      show_id: z.number(),
      customer: z.object({
        email: z.string().email(),
        first_name: z.string(),
        last_name: z.string(),
        street: z.string(),
        street2: z.string().optional(),
        city: z.string(),
        postal_code: z.string(),
        province: z.string(),
        phone: z.string().optional(),
      }).nullable(),
      products: z.array(
        z.object({
          id: z.number(),
          amount: z.number().min(1),
          price: z.string().optional(),
        }),
        { message: 'You are required to have at least one product.' }
      ),
      note: z.string().optional(),
    });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      show_id: params.show ? parseInt(params.show) : undefined,
      products: [{ id: undefined, amount: 1 }],
    },
  });

  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [customer, setCustomer] = useState<string | undefined>(undefined);
  const [customerSelectOpen, setCustomerSelectOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [shows, setShows] = useState<Show[] | null>(null);
  const [show, setShow] = useState<number | undefined>(undefined);
  const [showSelectOpen, setShowSelectOpen] = useState(false);
  const [showSearch, setShowSearch] = useState('');
  const [products, setProducts] = useState<Product[] | null>(null);
  const [productsSelectOpen, setProductsSelectOpen] = useState(false);
  const [productsSearch, setProductsSearch] = useState('');

  const debouncedCustomerSearch = useDebounceCallback(setCustomerSearch, 500, {
    trailing: true,
  });
  const debouncedShowSearch = useDebounceCallback(setShowSearch, 500, {
    trailing: true,
  });
  const debouncedProductsSearch = useDebounceCallback(setProductsSearch, 500, {
    trailing: true,
  });

  const fetchCustomers = useCallback(async () => {
    const res = await getCustomersAction({ search: customerSearch || '' });
    setCustomers(res as unknown as Customer[]);
  }, [customerSearch]);

  const fetchShows = useCallback(async () => {
    const res = await getShowsAction({ search: showSearch || '' });
    setShows(res as Show[]);
  }, [showSearch]);

  const fetchProducts = useCallback(async () => {
    const res = await getProductsAction({ search: productsSearch || '' });
    setProducts(res as Product[]);
  }, [productsSearch]);

  const mappedCustomers = useMemo(
    () =>
      customers?.map((customer) => ({
        value: customer.id,
        label: `${customer.first_name} ${customer.last_name}`,
        subtitle: customer.email,
      })),
    [customers]
  );

  const mappedShows = useMemo(
    () =>
      shows?.map((show) => ({
        value: show.id,
        label: show.event.name,
        subtitle: `${format(new Date(show.start), DEFAULT_DATE_FORMAT)} - ${format(new Date(show.end), DEFAULT_DATE_FORMAT)}`,
      })),
    [shows]
  );

  useEffect(() => {
    if (customerSearch) fetchCustomers();
  }, [customerSearch, fetchCustomers]);
  useEffect(() => {
    if (customerSelectOpen && !customers) fetchCustomers();
  }, [customerSelectOpen, customers, fetchCustomers]);
  useEffect(() => {
    if (customer) {
      const data = customers?.find((c) => c.id === customer);
      if (data) {
        form.setValue('customer', {
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          street: data.address.street,
          street2: data.address.street2 || undefined,
          city: data.address.city,
          postal_code: data.address.postal_code,
          province: data.address.province,
          phone: data.phone,
        });
      }
    }
  }, [customer, customers, form]);

  useEffect(() => {
    if (showSearch) fetchShows();
  }, [showSearch, fetchShows]);
  useEffect(() => {
    if (showSelectOpen && !shows) fetchShows();
  }, [showSelectOpen, shows, fetchShows]);
  useEffect(() => {
    if (show) {
      const data = shows?.find((s) => s.id === show);
      if (data) form.setValue('show_id', data.id);
    }
  }, [show, shows, form]);

  useEffect(() => {
    if (productsSearch) fetchProducts();
  }, [productsSearch, fetchProducts]);
  useEffect(() => {
    if (productsSelectOpen && !products) fetchProducts();
  }, [productsSelectOpen, products, fetchProducts]);

  const {
    fields: productFields,
    append: appendProduct,
    remove: removeProduct,
  } = useFieldArray({
    control: form.control,
    name: 'products',
  });

  async function onSubmit(data: z.infer<typeof schema>) {
    // @ts-expect-error: customer is not defined
    await toast.promise(createOrdersAction(data), {
      loading: 'Creating order...',
      success: (data: { payment_url: string }) => {
        callback && callback();
        return (
          <p className='font-medium'>
            Order created.{' '}
            <a
              className='text-primary-500 underline'
              href={data.payment_url}
              target='_blank'
              rel='noreferrer'
            >
              Click here to complete payment
            </a>
          </p>
        );
      },
      error: 'Failed to create order',
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className=''>
        <div className='grid grid-cols-2 gap-2'>
          {!params.show && (
            <FormField
              control={form.control}
              name='show_id'
              render={() => (
                <FormItem>
                  <FormLabel>Show</FormLabel>
                  <FormControl>
                    <Combobox
                      async
                      required
                      className='w-full'
                      placeholder='Select show...'
                      name='show_id'
                      items={mappedShows}
                      open={showSelectOpen}
                      onOpenChange={setShowSelectOpen}
                      loading={!mappedShows}
                      onValueChange={(value) => setShow(value as number)}
                      onSearch={debouncedShowSearch}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name='customer'
            render={() => (
              <FormItem>
                <FormLabel>Customer (optional)</FormLabel>
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
                    onValueChange={(value) => setCustomer(value as string)}
                    onSearch={debouncedCustomerSearch}
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

        <div className='mt-4'>
          <FormLabel className='mb-2 block'>Products</FormLabel>
          <div className='space-y-2 divide-y'>
            {productFields.map((field, index) => (
              <OrderProductField
                className='pt-2 first:pt-0'
                key={field.id}
                index={index}
                field={field}
                form={form}
                products={products}
                onRemove={() => removeProduct(index)}
                onOpenChange={setProductsSelectOpen}
                onSearch={debouncedProductsSearch}
              />
            ))}
          </div>

          <div className='my-2 flex justify-end'>
            <Button
              size='sm'
              type='button'
              variant='secondary'
              onClick={() =>
                appendProduct({
                  id: products?.length ? products?.length + 1 : 1,
                  amount: 1,
                })
              }
            >
              <Plus className='mr-1 !size-3' /> Add product
            </Button>
          </div>
        </div>

        <div>
          <hr className='my-4' />
        </div>

        <FormField
          control={form.control}
          name='note'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormDescription>
                Any additional information about the order.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <hr className='my-4' />
        </div>

        <div className='flex justify-end'>
          <Button disabled={form.formState.isSubmitting} type='submit'>
            Create
          </Button>
        </div>
      </form>
    </Form>
  );
}
